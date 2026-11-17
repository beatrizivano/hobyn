import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import test from "node:test";

process.env.DATABASE_URL = "mysql://user:pass@localhost:3306/hobyn";
process.env.JWT_ACCESS_SECRET = randomBytes(32).toString("hex");
process.env.ACCESS_TOKEN_TTL = "15m";
process.env.REFRESH_TOKEN_TTL_DAYS = "7";

const { rankingRepository } = await import("./ranking.repository.js");
const { rankingService } = await import("./ranking.service.js");

test("ranking soma pontos, inclui membro sem logs e compartilha posição em empate", async t => {
  t.mock.method(rankingRepository, "findGroupForMember", async () => ({ id: "group-1" }));
  t.mock.method(rankingRepository, "listActiveMembers", async () => [
    { id: "u3", nome: "Caio", sobrenome: "Zero", fotoDePerfil: null },
    { id: "u2", nome: "Bia", sobrenome: "Lima", fotoDePerfil: null },
    { id: "u1", nome: "Ana", sobrenome: "Silva", fotoDePerfil: null },
    { id: "u4", nome: "Davi", sobrenome: "Souza", fotoDePerfil: null },
  ]);
  t.mock.method(rankingRepository, "sumPoints", async () => [
    { userId: "u1", _sum: { pontosGanhos: 10 } },
    { userId: "u2", _sum: { pontosGanhos: 10 } },
    { userId: "u4", _sum: { pontosGanhos: 5 } },
  ]);

  const ranking = await rankingService.list("u1", "group-1");
  assert.deepEqual(ranking.map(({ usuario, pontuacao, colocacao }) => [usuario.id, pontuacao, colocacao]), [
    ["u1", 10, 1], ["u2", 10, 1], ["u4", 5, 3], ["u3", 0, 4],
  ]);
});

test("ranking não revela grupo para quem não é membro ativo", async t => {
  t.mock.method(rankingRepository, "findGroupForMember", async () => null);
  await assert.rejects(rankingService.list("outsider", "group-1"), error => error.statusCode === 404);
});
