import { prisma } from "../../clients/prisma.client.js";

export const hobbyRepository = {
  findActiveGroupForUser(userId, groupId) {
    return prisma.grupo.findFirst({
      where: {
        id: groupId,
        deletedAt: null,
        usuarios: { some: { userId, saiuEm: null } },
      },
      select: {
        hobbiesPermitidos: { select: { hobbyId: true } },
      },
    });
  },

  listAllActive() {
    return prisma.hobby.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    });
  },

  listByIds(ids) {
    return prisma.hobby.findMany({
      where: { id: { in: ids }, ativo: true },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    });
  },
};
