import { HttpError } from "../../shared/http-error.js";
import { rankingRepository } from "./ranking.repository.js";

function compareUsers(left, right) {
  return `${left.usuario.nome} ${left.usuario.sobrenome}`.localeCompare(
    `${right.usuario.nome} ${right.usuario.sobrenome}`,
    "pt-BR",
    { sensitivity: "base" },
  ) || left.usuario.id.localeCompare(right.usuario.id);
}

export const rankingService = {
  async list(userId, groupId) {
    if (!await rankingRepository.findGroupForMember(groupId, userId)) {
      throw new HttpError("Grupo não encontrado.", 404);
    }

    const [members, totals] = await Promise.all([
      rankingRepository.listActiveMembers(groupId),
      rankingRepository.sumPoints(groupId),
    ]);
    const pointsByUser = new Map(totals.map(({ userId: id, _sum }) => [id, _sum.pontosGanhos ?? 0]));
    const ordered = members
      .map((usuario) => ({ usuario, pontuacao: pointsByUser.get(usuario.id) ?? 0 }))
      .sort((left, right) => right.pontuacao - left.pontuacao || compareUsers(left, right));

    let previousPoints;
    let position = 0;
    return ordered.map((entry, index) => {
      if (entry.pontuacao !== previousPoints) position = index + 1;
      previousPoints = entry.pontuacao;
      return { ...entry, colocacao: position };
    });
  },
};
