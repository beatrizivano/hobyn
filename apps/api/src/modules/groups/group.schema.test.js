import assert from "node:assert/strict";
import test from "node:test";
import { groupSchemas } from "./group.schema.js";

test("grupo valida limite diário e opções permitidas", () => {
  const result = groupSchemas.create.safeParse({
    nome: "Artes",
    descricao: "Grupo de artes",
    modoPontuacao: "registro",
    limiteRegistrosPorDia: 5,
    hobbyIds: ["hobby-1"],
  });

  assert.equal(result.success, true);
  assert.deepEqual(result.data.hobbyIds, ["hobby-1"]);
});

test("grupo rejeita limite fora da regra e hobbies duplicados", () => {
  const base = {
    nome: "Artes",
    descricao: "Grupo de artes",
    modoPontuacao: "registro",
  };

  assert.equal(
    groupSchemas.create.safeParse({ ...base, limiteRegistrosPorDia: 6 }).success,
    false,
  );
  assert.equal(
    groupSchemas.create.safeParse({ ...base, hobbyIds: ["h1", "h1"] }).success,
    false,
  );
});
