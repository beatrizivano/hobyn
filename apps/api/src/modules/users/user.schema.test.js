import assert from "node:assert/strict";
import test from "node:test";
import { userSchemas } from "./user.schema.js";

test("perfil aceita atualização parcial e normaliza email", () => {
  const result = userSchemas.updateProfile.safeParse({
    email: " USER@EXAMPLE.COM ",
  });

  assert.equal(result.success, true);
  assert.deepEqual(result.data, { email: "user@example.com" });
});

test("perfil rejeita atualização vazia ou campos privados", () => {
  assert.equal(userSchemas.updateProfile.safeParse({}).success, false);
  assert.equal(
    userSchemas.updateProfile.safeParse({ hashSenha: "nao-pode" }).success,
    false,
  );
});
