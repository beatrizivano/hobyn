import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import test from "node:test";

process.env.DATABASE_URL = "mysql://user:pass@localhost:3306/hobyn";
process.env.JWT_ACCESS_SECRET = randomBytes(32).toString("hex");
process.env.ACCESS_TOKEN_TTL = "15m";
process.env.REFRESH_TOKEN_TTL_DAYS = "7";

const { authenticate } = await import("./auth.middleware.js");
const { authRepository } = await import("../modules/auth/auth.repository.js");
const { accessTokenService } = await import("../modules/auth/access-token.service.js");
const { AuthError } = await import("../modules/auth/auth.error.js");
const jwt = (await import("jsonwebtoken")).default;
const request = authorization => ({ get: () => authorization });
const unauthorized = error => error instanceof AuthError && error.statusCode === 401;
function signed(payload, expiresIn = "15m") {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    subject: "user-1", issuer: "hobyn", audience: "hobyn-api", algorithm: "HS256", expiresIn,
  });
}

test("middleware bloqueia credenciais ausentes, tokens inválidos, vencidos e sem sessão antes de consultar o banco", async t => {
  const lookup = t.mock.method(authRepository, "findActiveSessionUser", () => { throw new Error("Consulta indevida"); });
  for (const header of [
    undefined, "Basic abc", "Bearer ", "Bearer token-invalido",
    `Bearer ${signed({ tokenType: "access" })}`,
    `Bearer ${signed({ tokenType: "access", sid: "" })}`,
    `Bearer ${signed({ tokenType: "access", sid: "session-1" }, -1)}`,
  ]) {
    await assert.rejects(authenticate(request(header), {}, () => assert.fail("Não deve liberar a rota")), unauthorized);
  }
  assert.equal(lookup.mock.callCount(), 0);
});

test("middleware libera a sessão consultada com o usuário do JWT e expõe apenas o usuário público", async t => {
  const user = { id: "user-1", nome: "Ana", email: "ana@example.com" };
  t.mock.method(authRepository, "findActiveSessionUser", async (userId, sessionId, now) => {
    assert.equal(userId, "user-1");
    assert.equal(sessionId, "session-1");
    assert.ok(now instanceof Date);
    return user;
  });
  const req = request(`Bearer ${accessTokenService.generate("user-1", "session-1")}`);
  let called = 0;
  await authenticate(req, {}, () => { called += 1; });
  assert.equal(called, 1);
  assert.equal(req.authUser, user);
  assert.equal(req.authSessionId, "session-1");
});

test("middleware não libera JWT válido quando não há sessão ativa correspondente", async t => {
  t.mock.method(authRepository, "findActiveSessionUser", async () => null);
  const req = request(`Bearer ${accessTokenService.generate("user-1", "session-1")}`);
  await assert.rejects(authenticate(req, {}, () => assert.fail("Não deve liberar a rota")), unauthorized);
  assert.equal(req.authUser, undefined);
});

test("falha do banco não é mascarada como credencial inválida", async t => {
  const failure = new Error("Banco indisponível");
  t.mock.method(authRepository, "findActiveSessionUser", async () => { throw failure; });
  await assert.rejects(authenticate(request(`Bearer ${accessTokenService.generate("user-1", "session-1")}`), {}, () => assert.fail("Não deve liberar a rota")), error => error === failure);
});
