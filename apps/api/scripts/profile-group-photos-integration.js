import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { access, mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";

const directory = await mkdtemp(join(tmpdir(), "hobyn-profile-group-photos-"));
process.env.UPLOAD_DIR = directory;
const { env } = await import("../src/infra/env.js");
const { prisma } = await import("../src/clients/prisma.client.js");
const { buildApp } = await import("../src/app.js");
assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(new URL(env.databaseUrl).hostname), "Este teste só pode usar um banco local.");

const userIds = [];
let groupId;
let server;
const exists = path => access(path).then(() => true, error => error.code === "ENOENT" ? false : Promise.reject(error));
const files = async scope => readdir(join(directory, scope)).catch(error => error.code === "ENOENT" ? [] : Promise.reject(error));
try {
  server = await new Promise((resolve, reject) => {
    const instance = buildApp().listen(0, "127.0.0.1", () => resolve(instance));
    instance.once("error", reject);
  });
  const base = `http://127.0.0.1:${server.address().port}/api`;
  async function request(path, { expected = 200, method = "GET", token, body } = {}) {
    const multipart = body instanceof FormData;
    const target = path.startsWith("/api/") ? `${base.slice(0, -4)}${path}` : base + path;
    const response = await fetch(target, { method, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body && !multipart ? { "Content-Type": "application/json" } : {}) }, ...(body ? { body: multipart ? body : JSON.stringify(body) } : {}), signal: AbortSignal.timeout(20000) });
    const binary = response.ok && response.headers.get("content-type")?.startsWith("image/");
    let data = null;
    if (response.status !== 204) {
      if (binary) data = Buffer.from(await response.arrayBuffer());
      else {
        const text = await response.text();
        try { data = JSON.parse(text); }
        catch { throw new Error(`${method} ${path} retornou conteúdo inesperado (${response.status}): ${text.slice(0, 300)}`); }
      }
    }
    assert.equal(response.status, expected, `${method} ${path} retornou ${response.status}: ${JSON.stringify(binary ? "imagem" : data)}`);
    return data;
  }
  async function account(nome) {
    const result = await request("/auth/register", { method: "POST", expected: 201, body: { nome, sobrenome: "Fotos", email: `photos.${randomUUID()}@example.com`, password: `${randomUUID()}Aa1` } });
    userIds.push(result.user.id);
    return result;
  }
  const admin = await account("Admin");
  const member = await account("Membro");
  const outsider = await account("Externo");
  const red = await sharp({ create: { width: 5, height: 4, channels: 3, background: "red" } }).png().toBuffer();
  const blue = await sharp({ create: { width: 4, height: 5, channels: 3, background: "blue" } }).jpeg().toBuffer();
  const photoForm = (buffer, type = "image/png") => { const form = new FormData(); form.set("foto", new File([buffer], "foto.png", { type })); return form; };

  let profile = await request("/users/me", { method: "PATCH", token: admin.accessToken, body: photoForm(red) });
  assert.match(profile.fotoDePerfil, new RegExp(`^/api/users/${admin.user.id}/photo\\?v=`));
  let storedUser = await prisma.usuario.findUnique({ where: { id: admin.user.id }, select: { fotoDePerfil: true } });
  const firstProfile = storedUser.fotoDePerfil;
  assert.match(firstProfile, /^profiles\/[0-9a-f-]{36}\.webp$/);
  await request(profile.fotoDePerfil, { expected: 401 });
  assert.equal((await sharp(await request(profile.fotoDePerfil, { token: outsider.accessToken })).metadata()).format, "webp");
  profile = await request("/users/me", { method: "PATCH", token: admin.accessToken, body: photoForm(blue, "image/jpeg") });
  storedUser = await prisma.usuario.findUnique({ where: { id: admin.user.id }, select: { fotoDePerfil: true } });
  assert.notEqual(storedUser.fotoDePerfil, firstProfile);
  assert.equal(await exists(join(directory, firstProfile)), false);
  const profileBaseline = await files("profiles");
  await request("/users/me", { method: "PATCH", token: admin.accessToken, expected: 400, body: photoForm(Buffer.from("falso")) });
  assert.deepEqual(await files("profiles"), profileBaseline);

  const create = new FormData();
  create.set("nome", "Grupo com foto"); create.set("descricao", "Fixture temporária"); create.set("modoPontuacao", "registro"); create.set("hobbyIds", "[]"); create.set("foto", new File([red], "grupo.png", { type: "image/png" }));
  const group = await request("/groups", { method: "POST", expected: 201, token: admin.accessToken, body: create });
  groupId = group.id;
  assert.match(group.foto, new RegExp(`^/api/groups/${groupId}/photo\\?v=`));
  await prisma.usuarioGrupo.create({ data: { userId: member.user.id, groupId, papel: "membro" } });
  let storedGroup = await prisma.grupo.findUnique({ where: { id: groupId }, select: { foto: true } });
  const firstGroup = storedGroup.foto;
  assert.match(firstGroup, /^groups\/[0-9a-f-]{36}\.webp$/);
  await request(group.foto, { expected: 401 });
  await request(group.foto, { token: outsider.accessToken, expected: 404 });
  assert.equal((await sharp(await request(group.foto, { token: member.accessToken })).metadata()).format, "webp");
  const groupBaseline = await files("groups");
  await request(`/groups/${groupId}`, { method: "PATCH", token: member.accessToken, expected: 403, body: photoForm(blue, "image/jpeg") });
  assert.deepEqual(await files("groups"), groupBaseline);
  const updatedGroup = await request(`/groups/${groupId}`, { method: "PATCH", token: admin.accessToken, body: photoForm(blue, "image/jpeg") });
  assert.notEqual(updatedGroup.foto, group.foto);
  storedGroup = await prisma.grupo.findUnique({ where: { id: groupId }, select: { foto: true } });
  assert.notEqual(storedGroup.foto, firstGroup);
  assert.equal(await exists(join(directory, firstGroup)), false);

  await request(`/groups/${groupId}`, { method: "DELETE", expected: 204, token: admin.accessToken });
  assert.deepEqual(await files("groups"), []);
  await request("/users/me", { method: "DELETE", expected: 204, token: admin.accessToken });
  assert.deepEqual(await files("profiles"), []);
  console.info("PASS: fotos de perfil e grupo são privadas, substituídas sem órfãos e removidas nas exclusões.");
} finally {
  if (groupId) {
    await prisma.usuarioGrupo.deleteMany({ where: { groupId } });
    await prisma.grupo.deleteMany({ where: { id: groupId } });
  }
  if (userIds.length) {
    await prisma.session.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.usuario.deleteMany({ where: { id: { in: userIds } } });
  }
  if (server) await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  await prisma.$disconnect();
  await rm(directory, { recursive: true, force: true });
}
