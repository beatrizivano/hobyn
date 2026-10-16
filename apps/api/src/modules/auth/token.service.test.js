import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import test from "node:test";

process.env.DATABASE_URL = "mysql://user:pass@localhost:3306/hobyn";
process.env.JWT_ACCESS_SECRET = randomBytes(32).toString("hex");
process.env.ACCESS_TOKEN_TTL = "15m";
process.env.REFRESH_TOKEN_TTL_DAYS = "7";

const { accessTokenService } = await import("./access-token.service.js");
const {
  refreshCookieOptions,
  refreshTokenService,
} = await import("./refresh-token.service.js");

test("access token pode ser validado e identifica o usuário", () => {
  const token = accessTokenService.generate("usuario-123");

  assert.deepEqual(accessTokenService.verify(token), {
    userId: "usuario-123",
  });
});

test("access token inválido é rejeitado", () => {
  assert.throws(() => accessTokenService.verify("token-invalido"));
});

test("refresh token é aleatório e armazenável somente como hash", () => {
  const firstToken = refreshTokenService.generate();
  const secondToken = refreshTokenService.generate();
  const hash = refreshTokenService.hash(firstToken);

  assert.notEqual(firstToken, secondToken);
  assert.notEqual(hash, firstToken);
  assert.equal(hash.length, 64);
  assert.equal(refreshTokenService.hash(firstToken), hash);
});

test("cookie de refresh não pode ser lido pelo JavaScript do navegador", () => {
  const options = refreshCookieOptions();
  const clearOptions = refreshCookieOptions({ clear: true });

  assert.equal(options.httpOnly, true);
  assert.equal(options.sameSite, "lax");
  assert.equal(options.path, "/api/auth");
  assert.ok(options.maxAge > 0);
  assert.equal("maxAge" in clearOptions, false);
});
