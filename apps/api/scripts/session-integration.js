import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { buildApp } from "../src/app.js";
import { prisma } from "../src/clients/prisma.client.js";
import { env } from "../src/infra/env.js";
import { accessTokenService } from "../src/modules/auth/access-token.service.js";
import { userService } from "../src/modules/users/user.service.js";

assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(new URL(env.databaseUrl).hostname), "Este teste cria fixtures e só pode usar um banco local.");
const createdUsers = [];
let server;
try {
  server = await new Promise((resolve, reject) => {
    const instance = buildApp().listen(0, "127.0.0.1", () => resolve(instance));
    instance.once("error", reject);
  });
  const base = `http://127.0.0.1:${server.address().port}/api`;
  async function request(path, { expected = 200, method = "GET", token, cookie, body } = {}) {
    const response = await fetch(base + path, {
      method,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(cookie ? { Cookie: cookie } : {}),
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(15000),
    });
    const data = response.status === 204 ? null : await response.json();
    assert.equal(response.status, expected, `${method} ${path} retornou ${response.status}`);
    return { ...data, cookie: response.headers.get("set-cookie")?.split(";")[0] };
  }
  async function register() {
    const credentials = { nome: "Teste", sobrenome: "Sessao", email: `session.${randomUUID()}@example.com`, password: `${randomUUID()}-Aa1` };
    const result = await request("/auth/register", { method: "POST", expected: 201, body: credentials });
    createdUsers.push(result.user.id);
    return { ...result, credentials };
  }
  const first = await register();
  const second = await register();
  const firstClaims = accessTokenService.verify(first.accessToken);
  const secondClaims = accessTokenService.verify(second.accessToken);
  await request("/auth/me", { token: first.accessToken });
  const refreshed = await request("/auth/refresh", { method: "POST", cookie: first.cookie });
  assert.equal(accessTokenService.verify(refreshed.accessToken).sessionId, firstClaims.sessionId);
  assert.notEqual(refreshed.cookie, first.cookie);
  await request("/auth/refresh", { method: "POST", cookie: first.cookie, expected: 401 });
  await request("/auth/me", { token: first.accessToken });
  await request("/auth/me", { token: refreshed.accessToken });
  console.info("PASS: cadastro e refresh mantêm a mesma sessão; tokens de acesso continuam válidos após rotação.");

  const independent = await request("/auth/login", { method: "POST", body: { email: first.credentials.email, password: first.credentials.password } });
  assert.notEqual(accessTokenService.verify(independent.accessToken).sessionId, firstClaims.sessionId);
  await request("/auth/logout", { method: "POST", cookie: refreshed.cookie, expected: 204 });
  await request("/auth/me", { token: first.accessToken, expected: 401 });
  await request("/auth/me", { token: refreshed.accessToken, expected: 401 });
  await request("/auth/refresh", { method: "POST", cookie: refreshed.cookie, expected: 401 });
  await request("/auth/me", { token: independent.accessToken });
  await request("/auth/me", { token: second.accessToken });
  console.info("PASS: logout bloqueia imediatamente os JWTs daquela sessão e preserva outros logins/usuários.");

  const mismatched = accessTokenService.generate(first.user.id, secondClaims.sessionId);
  await request("/auth/me", { token: mismatched, expected: 401 });
  const nonexistent = accessTokenService.generate(first.user.id, "sessao-inexistente");
  await request("/auth/me", { token: nonexistent, expected: 401 });
  console.info("PASS: sessão inexistente ou pertencente a outro usuário não autoriza o JWT.");

  await request("/users/me", { method: "DELETE", token: independent.accessToken, expected: 204 });
  await request("/auth/me", { token: independent.accessToken, expected: 401 });
  await request("/auth/me", { token: second.accessToken });
  console.info("PASS: exclusão da conta revoga seus acessos sem afetar outro usuário.");

  await prisma.session.update({ where: { id: secondClaims.sessionId }, data: { expiresAt: new Date(Date.now() - 1000) } });
  assert.equal(accessTokenService.verify(second.accessToken).userId, second.user.id);
  await request("/auth/me", { token: second.accessToken, expected: 401 });
  await request("/auth/refresh", { method: "POST", cookie: second.cookie, expected: 401 });
  console.info("PASS: sessão vencida é bloqueada mesmo quando a assinatura e a validade do JWT ainda são aceitas.");
} finally {
  try {
    for (const userId of createdUsers) await userService.deleteProfile(userId);
  } finally {
    if (server) await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    await prisma.$disconnect();
  }
}
