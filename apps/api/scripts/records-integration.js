import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdtemp, readdir, rmdir, stat, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";

const directory = await mkdtemp(join(tmpdir(), "hobyn-records-"));
process.env.UPLOAD_DIR = directory;
const { env } = await import("../src/infra/env.js");
const { prisma } = await import("../src/clients/prisma.client.js");
const { buildApp } = await import("../src/app.js");
const { userService } = await import("../src/modules/users/user.service.js");
const { recordRepository } = await import("../src/modules/records/record.repository.js");
const { PHOTO_MAX_BYTES } = await import("shared");
const users = [];
let groupId;
let server;
let base;
const files = () => readdir(join(directory, "records")).catch(error => error.code === "ENOENT" ? [] : Promise.reject(error));
async function start() {
  server = await new Promise((resolve, reject) => {
    const instance = buildApp().listen(0, "127.0.0.1", () => resolve(instance));
    instance.once("error", reject);
  });
  base = `http://127.0.0.1:${server.address().port}/api`;
}
async function stop() { if (server) { await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())); server = null; } }
async function request(path, { method = "GET", token, body, expected = 200 } = {}) {
  const multipart = body instanceof FormData;
  const response = await fetch(base + path, {
    method, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body && !multipart ? { "Content-Type": "application/json" } : {}) },
    ...(body ? { body: multipart ? body : JSON.stringify(body) } : {}), signal: AbortSignal.timeout(30000),
  });
  const binary = response.ok && response.headers.get("content-type")?.startsWith("image/");
  const data = response.status === 204 ? null : binary ? Buffer.from(await response.arrayBuffer()) : await response.json();
  assert.ok([expected].flat().includes(response.status), `${method} ${path} retornou ${response.status}: ${JSON.stringify(binary ? "foto" : data)}`);
  return { data, response };
}
async function account() {
  const result = (await request("/auth/register", { method: "POST", expected: 201, body: { nome: "Teste", sobrenome: "Upload", email: `upload.${randomUUID()}@example.com`, password: `${randomUUID()}Aa1` } })).data;
  users.push(result.user.id);
  return result;
}
const image = await sharp({ create: { width: 4, height: 3, channels: 3, background: "red" } }).png().toBuffer();
const replacement = await sharp({ create: { width: 4, height: 3, channels: 3, background: "blue" } }).png().toBuffer();
let author;
let partner;
let hobby;
function form(overrides = {}, buffer = image, type = "image/png") {
  const data = { groupId, hobbyId: hobby.id, data: new Date().toISOString().slice(0, 10), duracaoMinutos: "30", descricao: "Atividade de teste", userIds: JSON.stringify([author.user.id]), ...overrides };
  const value = new FormData();
  for (const [key, field] of Object.entries(data)) value.set(key, String(field));
  if (buffer !== null) value.set("foto", new File([buffer], "../../foto.png", { type }));
  return value;
}
try {
  assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(new URL(env.databaseUrl).hostname), "Use somente MySQL local para este teste.");
  await start();
  author = await account(); partner = await account(); const outsider = await account();
  const hobbies = (await request("/hobbies", { token: author.accessToken })).data;
  hobby = hobbies.find(item => item.nome === "Leitura");
  const otherHobby = hobbies.find(item => item.id !== hobby.id);
  const group = (await request("/groups", { method: "POST", token: author.accessToken, expected: 201, body: { nome: "Teste de upload", descricao: "Fixture temporária", modoPontuacao: "registro", limiteRegistrosPorDia: 1, hobbyIds: [hobby.id] } })).data;
  groupId = group.id;
  // Associação exclusiva de fixture: convites continuam fora deste módulo.
  await prisma.usuarioGrupo.create({ data: { userId: partner.user.id, groupId, papel: "membro" } });
  const created = (await request("/records", { method: "POST", token: author.accessToken, body: form(), expected: 201 })).data;
  const id = created.record.id;
  let stored = await prisma.registro.findUnique({ where: { id } });
  assert.match(stored.foto, /^records\/[a-f0-9-]{36}\.webp$/);
  assert.equal(created.record.foto, `/api/records/${id}/photo`);
  assert.ok((await stat(join(directory, stored.foto))).size > 0);
  const initialPhoto = (await request(`/records/${id}/photo`, { token: author.accessToken })).data;
  assert.equal((await sharp(initialPhoto).metadata()).format, "webp");
  await request(`/records/${id}/photo`, { expected: 401 });
  await request(`/records/${id}/photo`, { token: outsider.accessToken, expected: 404 });
  await request(`/records/${id}/photo`, { token: partner.accessToken });
  const log = await prisma.logAtividades.findMany({ where: { registroId: id } });
  assert.ok(log.length > 0);
  const firstPoints = log.reduce((sum, row) => sum + row.pontosGanhos, 0);
  assert.ok(firstPoints > 0);
  console.info("PASS: multipart persiste foto e pontos; somente membros autenticados leem o arquivo.");

  await stop(); await start();
  assert.deepEqual((await request(`/records/${id}/photo`, { token: author.accessToken })).data, initialPhoto);
  console.info("PASS: foto recuperável após recriar o servidor HTTP, com a referência salva no MySQL.");

  const baseline = await files();
  for (const [body, expected] of [
    [form({}, null), 400], [form({}, Buffer.from("arquivo falso")), 400],
    [form({}, Buffer.from("<svg/>"), "image/svg+xml"), 415], [form({}, image, "image/jpeg"), 415],
    [form({}, Buffer.alloc(PHOTO_MAX_BYTES + 1)), 413],
    [form({ duracaoMinutos: "texto" }), 400], [form({ userIds: "json-invalido" }), 400],
    [form({ userIds: JSON.stringify([author.user.id, author.user.id]) }), 400],
    [form({ userIds: JSON.stringify([author.user.id, outsider.user.id]) }), 400],
    [form({ hobbyId: otherHobby.id }), 400],
  ]) {
    await request("/records", { method: "POST", token: author.accessToken, body, expected });
    assert.deepEqual(await files(), baseline);
  }
  await request("/records", { method: "POST", token: author.accessToken, body: { groupId, hobbyId: hobby.id, data: "2026-11-17", duracaoMinutos: 30, foto: "/arquivo-inventado.png" }, expected: 400 });
  await request("/records", { method: "POST", token: outsider.accessToken, body: form({ userIds: JSON.stringify([outsider.user.id]) }), expected: 404 });
  const twoPhotos = form(); twoPhotos.append("foto", new File([image], "outra.png", { type: "image/png" }));
  await request("/records", { method: "POST", token: author.accessToken, body: twoPhotos, expected: 400 });
  assert.deepEqual(await files(), baseline);
  console.info("PASS: arquivos falsos, tipos/tamanho inválidos, foto ausente, participantes e hobbies indevidos não deixam arquivos órfãos.");

  const extra = (await request("/records", { method: "POST", token: author.accessToken, body: form(), expected: 201 })).data;
  assert.deepEqual(extra.semPontuacaoUserIds, [author.user.id]);
  assert.equal(await prisma.logAtividades.count({ where: { registroId: extra.record.id } }), 0);
  const cooperative = (await request("/records", { method: "POST", token: author.accessToken, body: form({ userIds: JSON.stringify([author.user.id, partner.user.id]) }), expected: 201 })).data;
  assert.deepEqual(cooperative.pontuadosUserIds, [partner.user.id]);
  assert.deepEqual(cooperative.semPontuacaoUserIds, [author.user.id]);
  const cooperativeLogs = await prisma.logAtividades.findMany({ where: { registroId: cooperative.record.id } });
  assert.ok(cooperativeLogs.every(row => row.userId === partner.user.id));
  const multiplier = await prisma.pontuacao.findFirst({ where: { nome: "bonus_cooperativo" } });
  assert.equal(cooperativeLogs.reduce((sum, row) => sum + row.pontosGanhos, 0), Math.floor(firstPoints * Number(multiplier.valor)));
  const page1 = (await request(`/records?groupId=${groupId}&take=2`, { token: author.accessToken })).data;
  const page2 = (await request(`/records?groupId=${groupId}&take=2&cursor=${page1.nextCursor}`, { token: author.accessToken })).data;
  assert.equal(new Set([...page1.items, ...page2.items].map(row => row.id)).size, 3);
  assert.equal(page2.nextCursor, null);
  console.info("PASS: limite diário, cooperação, bônus e paginação com cursor usam dados reais.");

  await request(`/records/${id}`, { method: "PATCH", token: author.accessToken, body: { duracaoMinutos: 90, descricao: "Descrição atualizada" } });
  assert.equal((await prisma.registro.findUnique({ where: { id } })).duracaoMinutos, 90);
  assert.deepEqual(await prisma.logAtividades.findMany({ where: { registroId: id } }), log);
  const oldKey = stored.foto;
  const swap = new FormData(); swap.set("foto", new File([replacement], "nova.png", { type: "image/png" }));
  await request(`/records/${id}`, { method: "PATCH", token: author.accessToken, body: swap });
  stored = await prisma.registro.findUnique({ where: { id } });
  assert.notEqual(stored.foto, oldKey);
  await assert.rejects(stat(join(directory, oldKey)), error => error.code === "ENOENT");
  assert.notDeepEqual((await request(`/records/${id}/photo`, { token: author.accessToken })).data, initialPhoto);
  const beforeDenied = await files();
  const deniedSwap = new FormData(); deniedSwap.set("foto", new File([image], "indevida.png", { type: "image/png" }));
  await request(`/records/${id}`, { method: "PATCH", token: partner.accessToken, body: deniedSwap, expected: 404 });
  await request(`/records/${id}`, { method: "DELETE", token: partner.accessToken, expected: 404 });
  assert.deepEqual(await files(), beforeDenied);
  assert.deepEqual(await prisma.logAtividades.findMany({ where: { registroId: id } }), log);
  console.info("PASS: edição preserva pontos, substituição remove a foto anterior e não autores não alteram o registro.");

  await prisma.grupo.update({ where: { id: groupId }, data: { limiteRegistrosPorDia: null } });
  const beforeRecords = await prisma.registro.count({ where: { groupId } });
  const beforeLogs = await prisma.logAtividades.count({ where: { groupId } });
  const beforeFailure = await files();
  const original = recordRepository.createWithLogs;
  const originalError = console.error;
  const failure = new Error("Falha simulada após inserir registro e logs");
  recordRepository.createWithLogs = async (...args) => { await original.apply(recordRepository, args); throw failure; };
  console.error = (...args) => { if (args[0] !== failure) originalError(...args); };
  try {
    const rejected = (await request("/records", { method: "POST", token: author.accessToken, body: form(), expected: 500 })).data;
    assert.equal(rejected.error, "Erro interno do servidor.");
  } finally { recordRepository.createWithLogs = original; console.error = originalError; }
  assert.equal(await prisma.registro.count({ where: { groupId } }), beforeRecords);
  assert.equal(await prisma.logAtividades.count({ where: { groupId } }), beforeLogs);
  assert.deepEqual(await files(), beforeFailure);
  console.info("PASS: falha após a escrita reverte registro/logs no MySQL e remove a foto da tentativa.");

  await prisma.grupo.update({ where: { id: groupId }, data: { limiteRegistrosPorDia: 1 } });
  const beforeConcurrent = await files();
  const activityDay = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const concurrent = await Promise.all([1, 2].map(() => request("/records", { method: "POST", token: author.accessToken, body: form({ data: activityDay }), expected: [201, 409] })));
  const successful = concurrent.filter(result => result.response.status === 201).map(result => result.data.record.id);
  assert.ok(successful.length >= 1);
  const concurrentLogs = await prisma.logAtividades.findMany({ where: { registroId: { in: successful } } });
  assert.equal(concurrentLogs.reduce((sum, row) => sum + row.pontosGanhos, 0), firstPoints);
  assert.equal((await files()).length, beforeConcurrent.length + successful.length);
  console.info("PASS: envios concorrentes respeitam o limite diário e não deixam fotos de transações rejeitadas.");
  const filesBeforeClose = await files();
  await userService.deleteProfile(partner.user.id);
  const visibleGroup = (await request(`/groups/${groupId}`, { token: author.accessToken })).data;
  assert.ok(!visibleGroup.usuarios.some(member => member.userId === partner.user.id));
  await request("/records", { method: "POST", token: author.accessToken, body: form({ userIds: JSON.stringify([author.user.id, partner.user.id]) }), expected: 400 });
  assert.deepEqual(await files(), filesBeforeClose);
  console.info("PASS: contas excluídas não aparecem entre os participantes nem recebem novos registros cooperativos.");
  await prisma.grupo.update({ where: { id: groupId }, data: { endsAt: new Date(Date.now() - 1000) } });
  await request("/records", { method: "POST", token: author.accessToken, body: form(), expected: 409 });
  await request(`/records/${id}`, { method: "PATCH", token: author.accessToken, body: { descricao: "Bloqueado" }, expected: 409 });
  await request(`/records/${id}`, { method: "DELETE", token: author.accessToken, expected: 409 });
  await request(`/records/${id}/photo`, { token: author.accessToken });
  assert.deepEqual(await files(), filesBeforeClose);
  await prisma.grupo.update({ where: { id: groupId }, data: { endsAt: null } });
  await request(`/records/${id}`, { method: "DELETE", token: author.accessToken, expected: 204 });
  await request(`/records/${id}/photo`, { token: author.accessToken, expected: 404 });
  await assert.rejects(stat(join(directory, stored.foto)), error => error.code === "ENOENT");
  const preserved = await prisma.logAtividades.findMany({ where: { id: { in: log.map(row => row.id) } } });
  assert.ok(preserved.every(row => row.registroId === null));
  assert.equal(preserved.reduce((sum, row) => sum + row.pontosGanhos, 0), firstPoints);
  console.info("PASS: grupo encerrado é somente leitura; exclusão remove foto e mantém o histórico de pontos.");
} finally {
  try {
    if (groupId) {
      await prisma.grupo.update({ where: { id: groupId }, data: { endsAt: null } });
      const { recordService } = await import("../src/modules/records/record.service.js");
      for (const record of await prisma.registro.findMany({ where: { groupId } })) await recordService.delete(record.criadoPorId, record.id);
      await prisma.grupo.update({ where: { id: groupId }, data: { deletedAt: new Date() } });
    }
    for (const id of users) await userService.deleteProfile(id);
  } finally {
    await stop(); await prisma.$disconnect();
    for (const name of await files()) await unlink(join(directory, "records", name));
    await rmdir(join(directory, "records")).catch(error => { if (error.code !== "ENOENT") throw error; });
    await rmdir(directory);
  }
}
