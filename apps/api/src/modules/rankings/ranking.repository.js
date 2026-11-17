import { prisma } from "../../clients/prisma.client.js";

const userSelect = {
  id: true,
  nome: true,
  sobrenome: true,
  fotoDePerfil: true,
};

export const rankingRepository = {
  findGroupForMember(groupId, userId) {
    return prisma.grupo.findFirst({
      where: {
        id: groupId,
        deletedAt: null,
        usuarios: { some: { userId, saiuEm: null, usuario: { deletedAt: null } } },
      },
      select: { id: true },
    });
  },

  listActiveMembers(groupId) {
    return prisma.usuario.findMany({
      where: {
        deletedAt: null,
        grupos: { some: { groupId, saiuEm: null } },
      },
      select: userSelect,
    });
  },

  sumPoints(groupId) {
    return prisma.logAtividades.groupBy({
      by: ["userId"],
      where: { groupId },
      _sum: { pontosGanhos: true },
    });
  },
};
