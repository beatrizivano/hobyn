import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import test from "node:test";

process.env.DATABASE_URL = "mysql://user:pass@localhost:3306/hobyn";
process.env.JWT_ACCESS_SECRET = randomBytes(32).toString("hex");
process.env.ACCESS_TOKEN_TTL = "15m";
process.env.REFRESH_TOKEN_TTL_DAYS = "7";

const { recordRepository } = await import("./record.repository.js");
const { recordService } = await import("./record.service.js");

test("registro cooperativo usa o multiplicador configurado e cria logs por ação", async () => {
  const originals = new Map();
  const logs = [];
  const mock = (name, implementation) => {
    originals.set(name, recordRepository[name]);
    recordRepository[name] = implementation;
  };

  try {
    mock("transaction", (work) => work({}));
    mock("findActiveGroup", async () => ({
      id: "group-1",
      modoPontuacao: "registro",
      limiteRegistrosPorDia: null,
      endsAt: null,
      hobbiesPermitidos: [],
    }));
    mock("findActiveHobby", async () => ({ id: "hobby-1" }));
    mock("findActiveMemberships", async (_tx, _groupId, userIds) =>
      userIds.map((userId) => ({ userId })),
    );
    mock("findScore", async (_tx, name) => {
      if (name === "registro_hobby") {
        return { id: "score-base", valor: 5, unidadeTempoMinutos: null };
      }
      return { id: "score-coop", valor: 1.2, unidadeTempoMinutos: null };
    });
    mock("countDailyRecords", async () => 0);
    mock("createWithLogs", async (_tx, data, userIds, createdLogs) => {
      logs.push(...createdLogs);
      return { id: "record-1", ...data, userIds };
    });

    const result = await recordService.create("user-1", {
      groupId: "group-1",
      hobbyId: "hobby-1",
      data: "2026-10-16",
      duracaoMinutos: 30,
      foto: "/uploads/atividade.jpg",
      descricao: "",
      userIds: ["user-1", "user-2"],
    });

    assert.equal(logs.length, 4);
    assert.deepEqual(
      logs.map(({ pontuacaoId, pontosGanhos }) => [pontuacaoId, pontosGanhos]),
      [
        ["score-base", 5],
        ["score-coop", 1],
        ["score-base", 5],
        ["score-coop", 1],
      ],
    );
    assert.deepEqual(result.pontuadosUserIds, ["user-1", "user-2"]);
    assert.deepEqual(result.semPontuacaoUserIds, []);
  } finally {
    for (const [name, implementation] of originals) {
      recordRepository[name] = implementation;
    }
  }
});

test("limite diário salva o registro mas não gera log para quem excedeu", async () => {
  const originals = new Map();
  let logs = [];
  const mock = (name, implementation) => {
    originals.set(name, recordRepository[name]);
    recordRepository[name] = implementation;
  };

  try {
    mock("transaction", (work) => work({}));
    mock("findActiveGroup", async () => ({
      id: "group-1",
      modoPontuacao: "registro",
      limiteRegistrosPorDia: 1,
      endsAt: null,
      hobbiesPermitidos: [],
    }));
    mock("findActiveHobby", async () => ({ id: "hobby-1" }));
    mock("findActiveMemberships", async (_tx, _groupId, userIds) =>
      userIds.map((userId) => ({ userId })),
    );
    mock("findScore", async (_tx, name) =>
      name === "registro_hobby"
        ? { id: "score-base", valor: 5, unidadeTempoMinutos: null }
        : { id: "score-coop", valor: 1.2, unidadeTempoMinutos: null },
    );
    mock("countDailyRecords", async (_tx, _groupId, userId) =>
      userId === "user-2" ? 1 : 0,
    );
    mock("createWithLogs", async (_tx, data, userIds, createdLogs) => {
      logs = createdLogs;
      return { id: "record-2", ...data, userIds };
    });

    const result = await recordService.create("user-1", {
      groupId: "group-1",
      hobbyId: "hobby-1",
      data: "2026-10-16",
      duracaoMinutos: 30,
      foto: "/uploads/atividade.jpg",
      descricao: "",
      userIds: ["user-1", "user-2"],
    });

    assert.deepEqual(logs.map(({ userId }) => userId), ["user-1", "user-1"]);
    assert.equal(logs.some(({ userId }) => userId === "user-2"), false);
    assert.deepEqual(result.pontuadosUserIds, ["user-1"]);
    assert.deepEqual(result.semPontuacaoUserIds, ["user-2"]);
  } finally {
    for (const [name, implementation] of originals) {
      recordRepository[name] = implementation;
    }
  }
});
