import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import test from "node:test";

process.env.DATABASE_URL = "mysql://user:pass@localhost:3306/hobyn";
process.env.JWT_ACCESS_SECRET = randomBytes(32).toString("hex");
process.env.ACCESS_TOKEN_TTL = "15m";
process.env.REFRESH_TOKEN_TTL_DAYS = "7";

const { inviteRepository } = await import("./invite.repository.js");
const { inviteService } = await import("./invite.service.js");

test("somente administrador gera convite e prazo respeita encerramento", async t => {
  const endsAt = new Date(Date.now() + 60_000);
  let saved;
  t.mock.method(inviteRepository, "transaction", work => work({
    findMembership: async () => ({ papel: "admin", grupo: { endsAt, deletedAt: null } }),
    saveInvite: async (_groupId, _userId, codigo, expiresAt) => (saved = { codigo, expiresAt }),
  }));
  const invite = await inviteService.generate("user-1", "group-1");
  assert.match(invite.codigo, /^[A-HJ-NP-Z2-9]{16}$/);
  assert.equal(invite.expiresAt, endsAt);
  assert.deepEqual(saved, invite);
});

test("membro não pode gerenciar convite", async t => {
  t.mock.method(inviteRepository, "transaction", work => work({ findMembership: async () => ({ papel: "membro", grupo: { endsAt: null, deletedAt: null } }) }));
  await assert.rejects(inviteService.generate("user-2", "group-1"), error => error.statusCode === 403);
});

test("entrada cria membro sempre com a operação segura do repositório", async t => {
  let added = 0;
  t.mock.method(inviteRepository, "transaction", work => work({
    findInviteByCode: async () => ({ groupId: "group-1", expiresAt: new Date(Date.now() + 60_000), grupo: { endsAt: null, deletedAt: null } }),
    findMembership: async () => null,
    addMember: async () => { added += 1; },
  }));
  assert.deepEqual(await inviteService.join("user-2", "ABCDEFGHJKLMNPQR"), { groupId: "group-1", alreadyMember: false });
  assert.equal(added, 1);
});

test("entrada repetida é idempotente", async t => {
  let added = 0;
  t.mock.method(inviteRepository, "transaction", work => work({
    findInviteByCode: async () => ({ groupId: "group-1", expiresAt: new Date(Date.now() + 60_000), grupo: { endsAt: null, deletedAt: null } }),
    findMembership: async () => ({ papel: "membro" }),
    addMember: async () => { added += 1; },
  }));
  assert.deepEqual(await inviteService.join("user-2", "ABCDEFGHJKLMNPQR"), { groupId: "group-1", alreadyMember: true });
  assert.equal(added, 0);
});

test("convite expirado ou grupo encerrado não permite entrada", async t => {
  t.mock.method(inviteRepository, "transaction", work => work({ findInviteByCode: async () => ({ groupId: "group-1", expiresAt: new Date(Date.now() - 1), grupo: { endsAt: null, deletedAt: null } }) }));
  await assert.rejects(inviteService.join("user-2", "ABCDEFGHJKLMNPQR"), error => error.statusCode === 410);
});
