import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { buildApp } from "../src/app.js";
import { prisma } from "../src/clients/prisma.client.js";
import { env } from "../src/infra/env.js";

assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(new URL(env.databaseUrl).hostname), "Este teste só pode usar banco local.");
const userIds = []; let groupId; let recordId; let server;
try {
  server = await new Promise((resolve, reject) => { const instance = buildApp().listen(0, "127.0.0.1", () => resolve(instance)); instance.once("error", reject); });
  const base = `http://127.0.0.1:${server.address().port}/api`;
  async function request(path, { method = "GET", token, body, expected = 200 } = {}) { const response = await fetch(base + path, { method, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { "Content-Type": "application/json" } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) }); const data = response.status === 204 ? null : await response.json(); assert.equal(response.status, expected, `${method} ${path}: ${response.status} ${JSON.stringify(data)}`); return data; }
  async function account(nome) { const result = await request("/auth/register", { method: "POST", expected: 201, body: { nome, sobrenome: "Grupo", email: `member.${randomUUID()}@example.com`, password: `${randomUUID()}Aa1` } }); userIds.push(result.user.id); return result; }
  const admin = await account("Admin"); const oldest = await account("Antigo"); const newest = await account("Novo");
  const group = await request("/groups", { method: "POST", token: admin.accessToken, expected: 201, body: { nome: "Saída e sucessão", descricao: "Fixture", modoPontuacao: "registro" } }); groupId = group.id;
  await prisma.usuarioGrupo.createMany({ data: [
    { userId: oldest.user.id, groupId, papel: "membro", entrouEm: new Date("2026-01-01T10:00:00Z") },
    { userId: newest.user.id, groupId, papel: "membro", entrouEm: new Date("2026-02-01T10:00:00Z") },
  ] });
  const hobby = await prisma.hobby.findFirstOrThrow({ where: { ativo: true } }); const score = await prisma.pontuacao.findFirstOrThrow();
  const record = await prisma.registro.create({ data: { data: new Date("2026-11-01T00:00:00Z"), duracaoMinutos: 30, foto: "records/historico.webp", groupId, hobbyId: hobby.id, descricao: "Histórico preservado", criadoPorId: admin.user.id, usuarios: { create: { userId: admin.user.id } }, logsAtividades: { create: { userId: admin.user.id, groupId, pontuacaoId: score.id, pontosGanhos: 5 } } } }); recordId = record.id;
  await request(`/groups/${groupId}/members/${newest.user.id}`, { method: "DELETE", token: oldest.accessToken, expected: 404 });
  const left = await request(`/groups/${groupId}/leave`, { method: "POST", token: admin.accessToken });
  assert.deepEqual(left, { left: true, newAdminId: oldest.user.id });
  assert.ok((await prisma.usuarioGrupo.findFirst({ where: { groupId, userId: admin.user.id } })).saiuEm);
  assert.equal((await prisma.usuarioGrupo.findFirst({ where: { groupId, userId: oldest.user.id, saiuEm: null } })).papel, "admin");
  await request(`/groups/${groupId}`, { token: admin.accessToken, expected: 404 });
  assert.equal(await prisma.registro.count({ where: { id: recordId, criadoPorId: admin.user.id } }), 1);
  assert.equal(await prisma.registroUsuario.count({ where: { registroId: recordId, userId: admin.user.id } }), 1);
  assert.equal(await prisma.logAtividades.count({ where: { registroId: recordId, userId: admin.user.id } }), 1);
  await request(`/groups/${groupId}/members/${newest.user.id}`, { method: "DELETE", token: oldest.accessToken, expected: 204 });
  await request(`/groups/${groupId}`, { token: newest.accessToken, expected: 404 });
  assert.ok((await prisma.usuarioGrupo.findFirst({ where: { groupId, userId: newest.user.id } })).saiuEm);
  await request(`/groups/${groupId}/leave`, { method: "POST", token: oldest.accessToken, expected: 409 });
  console.info("PASS: saída preserva histórico, remoção é exclusiva do admin e sucessão escolhe o membro mais antigo.");
} finally {
  if (groupId) { await prisma.logAtividades.deleteMany({ where: { groupId } }); if (recordId) await prisma.registroUsuario.deleteMany({ where: { registroId: recordId } }); await prisma.registro.deleteMany({ where: { groupId } }); await prisma.usuarioGrupo.deleteMany({ where: { groupId } }); await prisma.grupo.deleteMany({ where: { id: groupId } }); }
  if (userIds.length) { await prisma.session.deleteMany({ where: { userId: { in: userIds } } }); await prisma.usuario.deleteMany({ where: { id: { in: userIds } } }); }
  if (server) await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())); await prisma.$disconnect();
}
