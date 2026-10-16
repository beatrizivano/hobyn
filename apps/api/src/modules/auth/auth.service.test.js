import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import test from "node:test";

process.env.DATABASE_URL = "mysql://user:pass@localhost:3306/hobyn";
process.env.JWT_ACCESS_SECRET = randomBytes(32).toString("hex");
process.env.ACCESS_TOKEN_TTL = "15m";
process.env.REFRESH_TOKEN_TTL_DAYS = "7";

const { authRepository } = await import("./auth.repository.js");
const { authService } = await import("./auth.service.js");
const { AuthError } = await import("./auth.error.js");
const { accessTokenService } = await import("./access-token.service.js");
const { refreshTokenService } = await import("./refresh-token.service.js");
const bcrypt = (await import("bcryptjs")).default;

test("register grava hash da senha junto com a sessão e não expõe o hash", async () => {
  const password = "senha-segura-123";
  const original = authRepository.createUserWithSession;
  let persistedData;

  authRepository.createUserWithSession = async (data) => {
    persistedData = data;
    return {
      id: "usuario-456",
      nome: data.userData.nome,
      sobrenome: data.userData.sobrenome,
      email: data.userData.email,
      fotoDePerfil: null,
      createdAt: new Date(),
    };
  };

  try {
    const result = await authService.register({
      nome: "Ana",
      sobrenome: "Silva",
      email: "ana@example.com",
      password,
    });

    assert.equal(
      await bcrypt.compare(password, persistedData.userData.hashSenha),
      true,
    );
    assert.equal(
      persistedData.refreshTokenHash,
      refreshTokenService.hash(result.refreshToken),
    );
    assert.equal(result.user.hashSenha, undefined);
    assert.equal(
      accessTokenService.verify(result.accessToken).userId,
      result.user.id,
    );
  } finally {
    authRepository.createUserWithSession = original;
  }
});

test("login renova e revoga sessões sem reutilizar refresh tokens", async () => {
  const password = "senha-segura-123";
  const user = {
    id: "usuario-123",
    nome: "Ana",
    sobrenome: "Silva",
    email: "ana@example.com",
    hashSenha: await bcrypt.hash(password, 4),
    fotoDePerfil: null,
    createdAt: new Date(),
    deletedAt: null,
  };
  const originals = new Map();
  let session;

  const mock = (name, implementation) => {
    originals.set(name, authRepository[name]);
    authRepository[name] = implementation;
  };

  try {
    mock("findUserByEmail", async () => user);
    mock("createSession", async (data) => {
      session = {
        id: "sessao-123",
        ...data,
        revokedAt: null,
      };
      return session;
    });
    mock("findSessionByRefreshTokenHash", async (hash) =>
      session?.refreshTokenHash === hash
        ? { ...session, usuario: user }
        : null,
    );
    mock("rotateSession", async ({ id, currentHash, nextHash, expiresAt }) => {
      if (session.id !== id || session.refreshTokenHash !== currentHash) {
        return { count: 0 };
      }

      session.refreshTokenHash = nextHash;
      session.expiresAt = expiresAt;
      return { count: 1 };
    });
    mock("revokeSession", async (hash, revokedAt) => {
      if (session.refreshTokenHash === hash) {
        session.revokedAt = revokedAt;
        return { count: 1 };
      }
      return { count: 0 };
    });

    const login = await authService.login({
      email: user.email,
      password,
    });
    assert.equal(accessTokenService.verify(login.accessToken).userId, user.id);
    assert.notEqual(
      session.refreshTokenHash,
      login.refreshToken,
      "a sessão deve armazenar o hash, não o refresh token",
    );

    const refreshed = await authService.refresh(login.refreshToken);
    assert.notEqual(refreshed.refreshToken, login.refreshToken);
    assert.equal(
      session.refreshTokenHash,
      refreshTokenService.hash(refreshed.refreshToken),
    );
    await assert.rejects(
      authService.refresh(login.refreshToken),
      (error) => error instanceof AuthError && error.statusCode === 401,
    );

    await authService.logout(refreshed.refreshToken);
    assert.ok(session.revokedAt instanceof Date);
  } finally {
    for (const [name, implementation] of originals) {
      authRepository[name] = implementation;
    }
  }
});
