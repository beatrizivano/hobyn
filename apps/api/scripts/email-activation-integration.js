import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

process.env.EMAIL_VERIFICATION_REQUIRED = "true";
process.env.MAIL_MODE = "log";
const { buildApp } = await import("../src/app.js");
const { prisma } = await import("../src/clients/prisma.client.js");
const { env } = await import("../src/infra/env.js");
const { developmentOutbox } = await import("../src/services/mail.service.js");
assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(new URL(env.databaseUrl).hostname), "Este teste só pode usar banco local.");
let server; let userId;
try {
  server = await new Promise((resolve, reject) => { const instance = buildApp().listen(0, "127.0.0.1", () => resolve(instance)); instance.once("error", reject); });
  const base = `http://127.0.0.1:${server.address().port}/api`;
  async function request(path, { method = "GET", body, expected = 200 } = {}) { const response = await fetch(base + path, { method, headers: body ? { "Content-Type": "application/json" } : {}, ...(body ? { body: JSON.stringify(body) } : {}) }); const data = response.status === 204 ? null : await response.json(); assert.equal(response.status, expected, `${path}: ${response.status} ${JSON.stringify(data)}`); return data; }
  const email = `activation.${randomUUID()}@example.com`; const password = `${randomUUID()}Aa1`;
  const registered = await request("/auth/register", { method: "POST", expected: 201, body: { nome: "Conta", sobrenome: "Pendente", email, password } });
  assert.deepEqual(registered, { activationRequired: true, email });
  userId = (await prisma.usuario.findUnique({ where: { email } })).id;
  assert.equal(await prisma.session.count({ where: { userId } }), 0);
  await request("/auth/login", { method: "POST", expected: 403, body: { email, password } });
  const token = new URL(developmentOutbox.at(-1).text.match(/https?:\/\/\S+/)[0]).searchParams.get("token");
  await request("/auth/activate", { method: "POST", expected: 204, body: { token } });
  const login = await request("/auth/login", { method: "POST", body: { email, password } });
  assert.ok(login.accessToken);
  console.info("PASS: cadastro exige ativação por e-mail antes do primeiro login quando a opção está habilitada.");
} finally {
  if (userId) { await prisma.tokenEmail.deleteMany({ where: { userId } }); await prisma.session.deleteMany({ where: { userId } }); await prisma.usuario.delete({ where: { id: userId } }).catch(() => undefined); }
  if (server) await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  await prisma.$disconnect();
}
