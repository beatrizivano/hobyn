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
    const data = await response.json();
    assert.equal(response.status, expected, `${method} ${path} retornou ${response.status}: ${JSON.stringify(data)}`);
    return data;
  }
  async function account(nome) {
    const result = await request("/auth/register", { method: "POST", expected: 201, body: { nome, sobrenome: "Ranking", email: `ranking.${randomUUID()}@example.com`, password: `${randomUUID()}Aa1` } });
    userIds.push(result.user.id);
    return result;
  }
  const admin = await account("Ana");
  const tied = await account("Bia");
  const zero = await account("Caio");
  const former = await account("Davi");
  const outsider = await account("Eva");
  const group = await request("/groups", { method: "POST", expected: 201, token: admin.accessToken, body: { nome: "Ranking integração", descricao: "Fixture temporária", modoPontuacao: "registro" } });
  groupId = group.id;
  await prisma.usuarioGrupo.createMany({ data: [
    { userId: tied.user.id, groupId, papel: "membro" },
    { userId: zero.user.id, groupId, papel: "membro" },
    { userId: former.user.id, groupId, papel: "membro", saiuEm: new Date() },
  ] });
  const score = await prisma.pontuacao.findFirstOrThrow({ where: { nome: "registro_hobby", modo: "fixo" } });
  for (const [userId, points] of [[admin.user.id, 6], [admin.user.id, 4], [tied.user.id, 10], [former.user.id, 100]]) {
    await prisma.logAtividades.create({ data: { userId, groupId, pontuacaoId: score.id, pontosGanhos: points } });
  }

  await request(`/groups/${groupId}/ranking`, { expected: 401 });
  await request(`/groups/${groupId}/ranking`, { token: outsider.accessToken, expected: 404 });
  const ranking = await request(`/groups/${groupId}/ranking`, { token: admin.accessToken });
  assert.deepEqual(ranking.map(({ usuario, pontuacao, colocacao }) => [usuario.id, pontuacao, colocacao]), [
    [admin.user.id, 10, 1], [tied.user.id, 10, 1], [zero.user.id, 0, 3],
  ]);
  await prisma.grupo.update({ where: { id: groupId }, data: { endsAt: new Date(Date.now() - 1000) } });
  assert.equal((await request(`/groups/${groupId}/ranking`, { token: tied.accessToken })).length, 3);
  console.info("PASS: ranking soma logs, trata empates e zero ponto, omite ex-membros e permanece legível após encerramento.");
} finally {
  if (groupId) {
    await prisma.logAtividades.deleteMany({ where: { groupId } });
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
