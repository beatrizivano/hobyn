import bcrypt from "bcryptjs";
import { env } from "../../infra/env.js";
import { accessTokenService } from "./access-token.service.js";
import { AuthError } from "./auth.error.js";
import { authRepository } from "./auth.repository.js";
import { refreshTokenService } from "./refresh-token.service.js";

const passwordSaltRounds = 12;
const invalidCredentialsMessage = "Email ou senha inválidos.";

function sessionExpiresAt(now = new Date()) {
  return new Date(
    now.getTime() + env.refreshTokenTtlDays * 24 * 60 * 60 * 1000,
  );
}

async function createTokensForUser(user) {
  const refreshToken = refreshTokenService.generate();
  const accessToken = accessTokenService.generate(user.id);
  const now = new Date();

  await authRepository.createSession({
    userId: user.id,
    refreshTokenHash: refreshTokenService.hash(refreshToken),
    expiresAt: sessionExpiresAt(now),
  });

  return {
    user,
    accessToken,
    refreshToken,
  };
}

export const authService = {
  async register(data) {
    const hashSenha = await bcrypt.hash(data.password, passwordSaltRounds);
    const refreshToken = refreshTokenService.generate();
    const now = new Date();
    let user;

    try {
      user = await authRepository.createUserWithSession({
        userData: {
          nome: data.nome,
          sobrenome: data.sobrenome,
          email: data.email,
          hashSenha,
        },
        refreshTokenHash: refreshTokenService.hash(refreshToken),
        expiresAt: sessionExpiresAt(now),
      });
    } catch (error) {
      if (error?.code === "P2002") {
        throw new AuthError("Já existe uma conta com este email.", 409);
      }
      throw error;
    }

    return {
      user,
      accessToken: accessTokenService.generate(user.id),
      refreshToken,
    };
  },

  async login(data) {
    const user = await authRepository.findUserByEmail(data.email);

    if (
      !user ||
      user.deletedAt ||
      !(await bcrypt.compare(data.password, user.hashSenha))
    ) {
      throw new AuthError(invalidCredentialsMessage);
    }

    const publicUser = {
      id: user.id,
      nome: user.nome,
      sobrenome: user.sobrenome,
      email: user.email,
      fotoDePerfil: user.fotoDePerfil,
      createdAt: user.createdAt,
    };

    return createTokensForUser(publicUser);
  },

  async refresh(token) {
    if (typeof token !== "string" || token.length === 0) {
      throw new AuthError("Sessão inválida ou expirada.");
    }

    const currentHash = refreshTokenService.hash(token);
    const session =
      await authRepository.findSessionByRefreshTokenHash(currentHash);
    const now = new Date();

    if (
      !session ||
      session.revokedAt ||
      session.expiresAt <= now ||
      session.usuario.deletedAt
    ) {
      throw new AuthError("Sessão inválida ou expirada.");
    }

    const refreshToken = refreshTokenService.generate();
    const refreshTokenHash = refreshTokenService.hash(refreshToken);
    const accessToken = accessTokenService.generate(session.usuario.id);
    const expiresAt = sessionExpiresAt(now);
    const updated = await authRepository.rotateSession({
      id: session.id,
      currentHash,
      nextHash: refreshTokenHash,
      now,
      expiresAt,
    });

    if (updated.count !== 1) {
      throw new AuthError("Sessão inválida ou expirada.");
    }

    return {
      user: {
        id: session.usuario.id,
        nome: session.usuario.nome,
        sobrenome: session.usuario.sobrenome,
        email: session.usuario.email,
        fotoDePerfil: session.usuario.fotoDePerfil,
        createdAt: session.usuario.createdAt,
      },
      accessToken,
      refreshToken,
    };
  },

  async logout(token) {
    if (typeof token === "string" && token.length > 0) {
      await authRepository.revokeSession(
        refreshTokenService.hash(token),
        new Date(),
      );
    }
  },
};
