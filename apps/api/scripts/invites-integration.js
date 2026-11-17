import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { buildApp } from "../src/app.js";
import { prisma } from "../src/clients/prisma.client.js";
import { env } from "../src/infra/env.js";

assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(new URL(env.databaseUrl).hostname), "Este teste só pode usar um banco local.");
const userIds = [];
let groupId;
let server;
try {
  server = await new Promise((resolve, reject) => {
    const instance = buildApp().listen(0, "127.0.0.1", () => resolve(instance));
    instance.once("error", reject);
  });
  const base = `http://127.0.0.1:${server.address().port}/api`;
  async function request(path, { expected = 200, method = "GET", token, body } = {}) {
    const response = await fetch(base + path, { method, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { "Content-Type": "application/json" } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(15000) });
    const data = response.status === 204 ? null : await response.json();
    assert.ok([expected].flat().includes(response.status), `${method} ${path} retornou ${response.status}: ${JSON.stringify(data)}`);
    return data;
  }
  async function account(label) {
    const result = await request("/auth/register", { method: "POST", expected: 201, body: { nome: "Teste", sobrenome: label, email: `invite.${randomUUID()}@example.com`, password: `${randomUUID()}Aa1` } });
    userIds.push(result.user.id);
    return result;
  }
  const admin = await account("Admin");
  const member = await account("Membro");
  const concurrent = await account("Concorrente");
  const group = await request("/groups", { method: "POST", expected: 201, token: admin.accessToken, body: { nome: "Convites integração", descricao: "Fixture temporária", modoPontuacao: "registro" } });
  groupId = group.id;
  await request(`/groups/${groupId}/invite`, { token: admin.accessToken, expected: 200 });
  await request(`/groups/${groupId}/invite`, { token: member.accessToken, expected: 404 });
  const first = await request(`/groups/${groupId}/invite`, { method: "POST", token: admin.accessToken, expected: 201 });
  assert.match(first.codigo, /^[A-HJ-NP-Z2-9]{16}$/);
  assert.deepEqual(await request(`/groups/${groupId}/invite`, { token: admin.accessToken }), first);

  const joined = await request("/invites/join", { method: "POST", token: member.accessToken, expected: 201, body: { codigo: first.codigo.match(/.{4}/g).join("-") } });
  assert.deepEqual(joined, { groupId, alreadyMember: false });
  assert.equal((await request("/invites/join", { method: "POST", token: member.accessToken, body: { codigo: first.codigo } })).alreadyMember, true);
  await request(`/groups/${groupId}`, { token: member.accessToken });
  await request(`/groups/${groupId}/invite`, { method: "POST", token: member.accessToken, expected: 403 });
  await request("/invites/join", { method: "POST", token: concurrent.accessToken, expected: 400, body: { codigo: first.codigo, papel: "admin" } });

  const renewed = await request(`/groups/${groupId}/invite`, { method: "POST", token: admin.accessToken, expected: 201 });
  assert.notEqual(renewed.codigo, first.codigo);
  await request("/invites/join", { method: "POST", token: concurrent.accessToken, expected: 404, body: { codigo: first.codigo } });
  const simultaneous = await Promise.all([
    request("/invites/join", { method: "POST", token: concurrent.accessToken, expected: [200, 201], body: { codigo: renewed.codigo } }),
    request("/invites/join", { method: "POST", token: concurrent.accessToken, expected: [200, 201], body: { codigo: renewed.codigo } }),
  ]);
  assert.deepEqual(simultaneous.map(item => item.alreadyMember).sort(), [false, true]);
  assert.equal(await prisma.usuarioGrupo.count({ where: { groupId, userId: concurrent.user.id, saiuEm: null } }), 1);
  await prisma.conviteGrupo.update({ where: { groupId }, data: { expiresAt: new Date(Date.now() - 1000) } });
  await request("/invites/join", { method: "POST", token: admin.accessToken, expected: 410, body: { codigo: renewed.codigo } });
  console.info("PASS: emissão, permissões, renovação, expiração e entrada idempotente/concorrente por convite.");
} finally {
  if (groupId) {
    await prisma.conviteGrupo.deleteMany({ where: { groupId } });
    await prisma.usuarioGrupo.deleteMany({ where: { groupId } });
    await prisma.grupo.deleteMany({ where: { id: groupId } });
  }
  if (userIds.length) {
    await prisma.session.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.usuario.deleteMany({ where: { id: { in: userIds } } });
  }
  if (server) await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  await prisma.$disconnect();
}
