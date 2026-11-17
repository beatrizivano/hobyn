import { prisma } from "../../clients/prisma.client.js";

function operations(client) {
  return {
    findMembership(userId, groupId) {
      return client.usuarioGrupo.findFirst({
        where: { userId, groupId, saiuEm: null, grupo: { deletedAt: null } },
        select: { id: true, papel: true, grupo: { select: { id: true, endsAt: true, deletedAt: true } } },
      });
    },
    findInviteByGroup(groupId) {
      return client.conviteGrupo.findUnique({ where: { groupId }, select: { codigo: true, expiresAt: true } });
    },
    findInviteByCode(codigo) {
      return client.conviteGrupo.findUnique({
        where: { codigo },
        select: { groupId: true, expiresAt: true, grupo: { select: { id: true, endsAt: true, deletedAt: true } } },
      });
    },
    saveInvite(groupId, criadoPorId, codigo, expiresAt) {
      return client.conviteGrupo.upsert({
        where: { groupId },
        create: { groupId, criadoPorId, codigo, expiresAt },
        update: { criadoPorId, codigo, expiresAt },
        select: { codigo: true, expiresAt: true },
      });
    },
    addMember(userId, groupId) {
      return client.usuarioGrupo.create({ data: { userId, groupId, papel: "membro" }, select: { id: true } });
    },
  };
}

export const inviteRepository = {
  transaction(work) {
    return prisma.$transaction((transaction) => work(operations(transaction)), {
      isolationLevel: "Serializable",
    });
  },
};
