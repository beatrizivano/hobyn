import assert from "node:assert/strict";
import test from "node:test";
import { inviteSchemas } from "shared";

test("convite normaliza código formatado", () => {
  assert.deepEqual(inviteSchemas.join.parse({ codigo: " abcd-efgh-jklm-npqr " }), { codigo: "ABCDEFGHJKLMNPQR" });
});

test("convite rejeita código inválido e campos extras", () => {
  assert.equal(inviteSchemas.join.safeParse({ codigo: "curto" }).success, false);
  assert.equal(inviteSchemas.join.safeParse({ codigo: "ABCDEFGHJKLMNPQR", papel: "admin" }).success, false);
});
