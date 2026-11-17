import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { buildApp } from "../src/app.js";
import { prisma } from "../src/clients/prisma.client.js";
import { env } from "../src/infra/env.js";
import { developmentOutbox } from "../src/services/mail.service.js";

assert.equal(env.mailMode, "log", "Use MAIL_MODE=log neste teste.");
assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(new URL(env.databaseUrl).hostname), "Este teste só pode usar banco local.");
let server; let userId;
try {
  server = await new Promise((resolve, reject) => { const instance = buildApp().listen(0, "127.0.0.1", () => resolve(instance)); instance.once("error", reject); });
  const base = `http://127.0.0.1:${server.address().port}/api`;
  async function request(path, { method = "GET", body, token, expected = 200 } = {}) {
    const response = await fetch(base + path, { method, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { "Content-Type": "application/json" } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(15000) });
    const data = response.status === 204 ? null : await response.json();
    assert.equal(response.status, expected, `${method} ${path}: ${response.status} ${JSON.stringify(data)}`); return data;
  }
  const email = `password.${randomUUID()}@example.com`; const oldPassword = `${randomUUID()}Aa1`; const resetPassword = `${randomUUID()}Bb2`; const changedPassword = `${randomUUID()}Cc3`;
  const registered = await request("/auth/register", { method: "POST", expected: 201, body: { nome: "Teste", sobrenome: "Senha", email, password: oldPassword } });
  userId = registered.user.id;
  const beforeUnknown = developmentOutbox.length;
  await request("/auth/password/forgot", { method: "POST", expected: 202, body: { email: `missing.${randomUUID()}@example.com` } });
  assert.equal(developmentOutbox.length, beforeUnknown);
  await request("/auth/password/forgot", { method: "POST", expected: 202, body: { email } });
  const resetToken = new URL(developmentOutbox.at(-1).text.match(/https?:\/\/\S+/)[0]).searchParams.get("token");
  await request("/auth/password/reset", { method: "POST", expected: 204, body: { token: resetToken, password: resetPassword } });
  await request("/auth/me", { token: registered.accessToken, expected: 401 });
  await request("/auth/login", { method: "POST", body: { email, password: oldPassword }, expected: 401 });
  await request("/auth/password/reset", { method: "POST", body: { token: resetToken, password: resetPassword }, expected: 400 });
  const first = await request("/auth/login", { method: "POST", body: { email, password: resetPassword } });
  const second = await request("/auth/login", { method: "POST", body: { email, password: resetPassword } });
  await request("/auth/password/change/request", { method: "POST", token: first.accessToken, expected: 202 });
  const changeToken = new URL(developmentOutbox.at(-1).text.match(/https?:\/\/\S+/)[0]).searchParams.get("token");
  await request("/auth/password/change/confirm", { method: "POST", token: first.accessToken, body: { token: changeToken, currentPassword: oldPassword, password: changedPassword }, expected: 400 });
  await request("/auth/password/change/confirm", { method: "POST", token: first.accessToken, body: { token: changeToken, currentPassword: resetPassword, password: changedPassword }, expected: 204 });
  await request("/auth/me", { token: first.accessToken, expected: 401 }); await request("/auth/me", { token: second.accessToken, expected: 401 });
  await request("/auth/login", { method: "POST", body: { email, password: changedPassword } });
  await prisma.usuario.update({ where: { id: userId }, data: { emailVerificadoEm: null } });
  await request("/auth/activate/resend", { method: "POST", expected: 202, body: { email } });
  const activationToken = new URL(developmentOutbox.at(-1).text.match(/https?:\/\/\S+/)[0]).searchParams.get("token");
  await request("/auth/activate", { method: "POST", expected: 204, body: { token: activationToken } });
  assert.ok((await prisma.usuario.findUnique({ where: { id: userId } })).emailVerificadoEm);
  await request("/auth/activate", { method: "POST", expected: 400, body: { token: activationToken } });
  console.info("PASS: recuperação, ativação e troca autenticada usam links únicos e revogam todas as sessões.");
} finally {
  if (userId) { await prisma.tokenEmail.deleteMany({ where: { userId } }); await prisma.session.deleteMany({ where: { userId } }); await prisma.usuario.delete({ where: { id: userId } }).catch(() => undefined); }
  if (server) await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  await prisma.$disconnect();
}
