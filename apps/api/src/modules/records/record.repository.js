import { prisma } from "../../clients/prisma.client.js";

const userSelect = {
  id: true,
  nome: true,
  sobrenome: true,
  fotoDePerfil: true,
};

const recordInclude = {
  hobby: true,
  criadoPor: { select: userSelect },
  usuarios: { include: { usuario: { select: userSelect } } },
};

export const recordRepository = {
  transaction(work) {
    return prisma.$transaction(work, { isolationLevel: "Serializable" });
  },

  findActiveGroup(transaction, groupId, userId) {
    return transaction.grupo.findFirst({
      where: {
        id: groupId,
        deletedAt: null,
        usuarios: { some: { userId, saiuEm: null } },
      },
      include: {
        hobbiesPermitidos: { select: { hobbyId: true } },
      },
    });
  },

  findActiveMemberships(transaction, groupId, userIds) {
    return transaction.usuarioGrupo.findMany({
      where: {
        groupId,
        userId: { in: userIds },
        saiuEm: null,
        usuario: { deletedAt: null },
      },
      select: { userId: true },
    });
  },

  findActiveHobby(transaction, hobbyId) {
    return transaction.hobby.findFirst({
      where: { id: hobbyId, ativo: true },
      select: { id: true },
    });
  },

  findScore(transaction, nome, modo) {
    return transaction.pontuacao.findFirst({
      where: { nome, ...(modo ? { modo } : {}) },
      orderBy: { modo: "asc" },
    });
  },

  countDailyRecords(transaction, groupId, userId, data) {
    return transaction.registro.count({
      where: {
        groupId,
        data,
        usuarios: { some: { userId } },
      },
    });
  },

  createWithLogs(transaction, data, userIds, logs) {
    return transaction.registro.create({
      data: {
        data: data.data,
        duracaoMinutos: data.duracaoMinutos,
        foto: data.foto,
        descricao: data.descricao,
        groupId: data.groupId,
        hobbyId: data.hobbyId,
        criadoPorId: data.criadoPorId,
        usuarios: {
          create: userIds.map((userId) => ({
            usuario: { connect: { id: userId } },
          })),
        },
        logsAtividades: {
          create: logs,
        },
      },
      include: recordInclude,
    });
  },

  findGroupForUser(groupId, userId) {
    return prisma.grupo.findFirst({
      where: {
        id: groupId,
        deletedAt: null,
        usuarios: { some: { userId, saiuEm: null } },
      },
      select: { id: true },
    });
  },

  listForGroup(groupId, { take, cursor }) {
    return prisma.registro.findMany({
      where: { groupId },
      include: recordInclude,
      orderBy: [{ data: "desc" }, { createdAt: "desc" }, { id: "desc" }],
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
  },

  findForUser(recordId, userId) {
    return prisma.registro.findFirst({
      where: {
        id: recordId,
        grupo: {
          deletedAt: null,
          usuarios: { some: { userId, saiuEm: null } },
        },
      },
      include: {
        ...recordInclude,
        grupo: { select: { id: true, endsAt: true } },
      },
    });
  },

  async updateOwned(recordId, userId, data, userIds) {
    return prisma.$transaction(async (transaction) => {
      const existing = await transaction.registro.findFirst({
        where: {
          id: recordId,
          criadoPorId: userId,
          grupo: {
            deletedAt: null,
            usuarios: { some: { userId, saiuEm: null } },
          },
        },
        include: { grupo: { select: { endsAt: true } } },
      });

      if (!existing) {
        return { notFound: true };
      }
      if (existing.grupo.endsAt && existing.grupo.endsAt <= new Date()) {
        return { ended: true };
      }

      const currentGroup = await transaction.grupo.findUnique({
        where: { id: existing.groupId },
        include: { hobbiesPermitidos: { select: { hobbyId: true } } },
      });
      const memberships = await this.findActiveMemberships(
        transaction,
        existing.groupId,
        userIds ?? [],
      );
      if (userIds && memberships.length !== userIds.length) {
        return { invalidMembers: true };
      }

      if (data.hobbyId) {
        const hobby = await this.findActiveHobby(transaction, data.hobbyId);
        if (
          !hobby ||
          (currentGroup.hobbiesPermitidos.length > 0 &&
            !currentGroup.hobbiesPermitidos.some(
              ({ hobbyId }) => hobbyId === data.hobbyId,
            ))
        ) {
          return { invalidHobby: true };
        }
      }

      const { data: activityDate, ...fields } = data;
      await transaction.registro.update({
        where: { id: recordId },
        data: {
          ...fields,
          ...(activityDate ? { data: activityDate } : {}),
        },
      });

      if (userIds) {
        await transaction.registroUsuario.deleteMany({
          where: { registroId: recordId },
        });
        await transaction.registroUsuario.createMany({
          data: userIds.map((participantId) => ({
            registroId: recordId,
            userId: participantId,
          })),
        });
      }

      return transaction.registro.findUnique({
        where: { id: recordId },
        include: recordInclude,
      });
    });
  },

  async deleteOwned(recordId, userId) {
    return prisma.$transaction(async (transaction) => {
      const existing = await transaction.registro.findFirst({
        where: {
          id: recordId,
          criadoPorId: userId,
          grupo: {
            deletedAt: null,
            usuarios: { some: { userId, saiuEm: null } },
          },
        },
        include: { grupo: { select: { endsAt: true } } },
      });

      if (!existing) {
        return { notFound: true };
      }
      if (existing.grupo.endsAt && existing.grupo.endsAt <= new Date()) {
        return { ended: true };
      }

      await transaction.registro.delete({ where: { id: recordId } });
      return { deleted: true };
    });
  },
};
