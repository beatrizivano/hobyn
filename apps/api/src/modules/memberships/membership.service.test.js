import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import test from "node:test";

process.env.DATABASE_URL = "mysql://user:pass@localhost:3306/hobyn";
process.env.JWT_ACCESS_SECRET = randomBytes(32).toString("hex");
const { membershipRepository } = await import("./membership.repository.js");
const { membershipService } = await import("./membership.service.js");

test("saída do administrador devolve o sucessor escolhido pela transação", async t => {
  t.mock.method(membershipRepository, "leave", async () => ({ left: true, newAdminId: "oldest-member" }));
  assert.deepEqual(await membershipService.leave("group-1", "admin-1"), { left: true, newAdminId: "oldest-member" });
});

test("administrador não sai quando não existe sucessor", async t => {
  t.mock.method(membershipRepository, "leave", async () => ({ noSuccessor: true }));
  await assert.rejects(membershipService.leave("group-1", "admin-1"), error => error.statusCode === 409);
});

test("remoção exige alvo membro e orienta auto-remoção ao fluxo de saída", async t => {
  t.mock.method(membershipRepository, "remove", async () => ({ self: true }));
  await assert.rejects(membershipService.remove("group-1", "admin-1", "admin-1"), error => error.statusCode === 400);
});

test("conflito concorrente é repetido antes de retornar sucesso", async t => {
  let attempts = 0;
  t.mock.method(membershipRepository, "leave", async () => { attempts += 1; if (attempts < 3) throw Object.assign(new Error("conflito"), { code: "P2034" }); return { left: true, newAdminId: null }; });
  assert.equal((await membershipService.leave("group-1", "member-1")).left, true);
  assert.equal(attempts, 3);
});
