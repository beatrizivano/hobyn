import assert from "node:assert/strict";
import test from "node:test";
import { authSchemas } from "./auth.schema.js";

test("register valida dados e normaliza o email", () => {
  const result = authSchemas.register.safeParse({
    nome: "  Ana ",
    sobrenome: " Silva ",
    email: " ANA@EXAMPLE.COM ",
    password: "senha-segura-123",
  });

  assert.equal(result.success, true);
  assert.deepEqual(result.data, {
    nome: "Ana",
    sobrenome: "Silva",
    email: "ana@example.com",
    password: "senha-segura-123",
  });
});

test("register rejeita senha menor que 8 caracteres ou maior que 72 bytes", () => {
  const shortPassword = authSchemas.register.safeParse({
    nome: "Ana",
    sobrenome: "Silva",
    email: "ana@example.com",
    password: "curta",
  });
  const oversizedPassword = authSchemas.register.safeParse({
    nome: "Ana",
    sobrenome: "Silva",
    email: "ana@example.com",
    password: "á".repeat(37),
  });

  assert.equal(shortPassword.success, false);
  assert.equal(oversizedPassword.success, false);
});

test("schemas rejeitam propriedades que não fazem parte do contrato", () => {
  const result = authSchemas.login.safeParse({
    email: "ana@example.com",
    password: "senha-segura-123",
    isAdmin: true,
  });

  assert.equal(result.success, false);
});
