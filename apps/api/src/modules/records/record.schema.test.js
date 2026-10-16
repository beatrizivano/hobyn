import assert from "node:assert/strict";
import test from "node:test";
import { recordSchemas } from "./record.schema.js";

test("registro exige hobby, data, duração e foto", () => {
  const result = recordSchemas.create.safeParse({
    groupId: "group-1",
    hobbyId: "hobby-1",
    data: "2026-10-16",
    duracaoMinutos: 30,
    foto: "https://example.com/foto.jpg",
  });

  assert.equal(result.success, true);
  assert.equal(result.data.descricao, "");
});

test("registro rejeita data inválida e participantes duplicados", () => {
  const base = {
    groupId: "group-1",
    hobbyId: "hobby-1",
    duracaoMinutos: 30,
    foto: "/uploads/foto.jpg",
  };

  assert.equal(
    recordSchemas.create.safeParse({ ...base, data: "2026-02-30" }).success,
    false,
  );
  assert.equal(
    recordSchemas.create.safeParse({
      ...base,
      data: "2026-10-16",
      userIds: ["user-1", "user-1"],
    }).success,
    false,
  );
});
