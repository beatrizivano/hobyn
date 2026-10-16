import { prisma } from "../../clients/prisma.client.js";

const groupInclude = {
  hobbiesPermitidos: {
    include: {
      hobby: true,
    },
  },
  usuarios: {
    where: { saiuEm: null },
    include: {
      usuario: {
        select: {
          id: true,
          nome: true,
          sobrenome: true,
          fotoDePerfil: true,
        },
      },
    },
  },
};

export const groupRepository = {
  listForUser(userId) {
    return prisma.grupo.findMany({
      where: {
        deletedAt: null,
        usuarios: { some: { userId, saiuEm: null } },
      },
      include: groupInclude,
      orderBy: { createdAt: "desc" },
    });
  },

  findForUser(groupId, userId) {
    return prisma.grupo.findFirst({
      where: {
        id: groupId,
        deletedAt: null,
        usuarios: { some: { userId, saiuEm: null } },
      },
      include: groupInclude,
    });
  },

  findActiveMembership(userId, groupId) {
    return prisma.usuarioGrupo.findFirst({
      where: {
        userId,
        groupId,
        saiuEm: null,
        grupo: { deletedAt: null },
      },
      select: { id: true, papel: true, grupo: { select: { endsAt: true } } },
    });
  },

  async createForUser(userId, data) {
    return prisma.$transaction(async (transaction) => {
      const hobbyIds = data.hobbyIds ?? [];
      if (hobbyIds.length > 0) {
        const hobbies = await transaction.hobby.findMany({
          where: { id: { in: hobbyIds }, ativo: true },
          select: { id: true },
        });
        if (hobbies.length !== hobbyIds.length) {
          return { missingHobbies: true };
        }
      }

      const group = await transaction.grupo.create({
        data: {
          nome: data.nome,
          descricao: data.descricao,
          modoPontuacao: data.modoPontuacao,
          limiteRegistrosPorDia: data.limiteRegistrosPorDia ?? null,
          endsAt: data.endsAt ? new Date(data.endsAt) : null,
          foto: data.foto ?? null,
          criadoPorId: userId,
        },
      });

      await transaction.usuarioGrupo.create({
        data: { userId, groupId: group.id, papel: "admin" },
      });

      if (hobbyIds.length > 0) {
        await transaction.grupoHobby.createMany({
          data: hobbyIds.map((hobbyId) => ({ groupId: group.id, hobbyId })),
        });
      }

      return transaction.grupo.findUnique({
        where: { id: group.id },
        include: groupInclude,
      });
    });
  },

  async updateForUser(groupId, userId, data) {
    return prisma.$transaction(async (transaction) => {
      const membership = await transaction.usuarioGrupo.findFirst({
        where: {
          userId,
          groupId,
          saiuEm: null,
          papel: "admin",
          grupo: { deletedAt: null },
        },
        select: { id: true, grupo: { select: { endsAt: true } } },
      });

      if (!membership) {
        return { forbidden: true };
      }

      if (membership.grupo.endsAt && membership.grupo.endsAt <= new Date()) {
        return { ended: true };
      }

      if (data.hobbyIds !== undefined && data.hobbyIds.length > 0) {
        const hobbies = await transaction.hobby.findMany({
          where: { id: { in: data.hobbyIds }, ativo: true },
          select: { id: true },
        });
        if (hobbies.length !== data.hobbyIds.length) {
          return { missingHobbies: true };
        }
      }

      const { hobbyIds, endsAt, ...fields } = data;
      await transaction.grupo.update({
        where: { id: groupId },
        data: {
          ...fields,
          ...(endsAt !== undefined
            ? { endsAt: endsAt ? new Date(endsAt) : null }
            : {}),
        },
      });

      if (hobbyIds !== undefined) {
        await transaction.grupoHobby.deleteMany({ where: { groupId } });
        if (hobbyIds.length > 0) {
          await transaction.grupoHobby.createMany({
            data: hobbyIds.map((hobbyId) => ({ groupId, hobbyId })),
          });
        }
      }

      return transaction.grupo.findUnique({
        where: { id: groupId },
        include: groupInclude,
      });
    });
  },

  async softDeleteForUser(groupId, userId, now) {
    const membership = await prisma.usuarioGrupo.findFirst({
      where: {
        userId,
        groupId,
        saiuEm: null,
        papel: "admin",
        grupo: { deletedAt: null },
      },
      select: { id: true, grupo: { select: { endsAt: true } } },
    });

    if (!membership) {
      return { forbidden: true };
    }
    if (membership.grupo.endsAt && membership.grupo.endsAt <= now) {
      return { ended: true };
    }

    await prisma.grupo.update({
      where: { id: groupId },
      data: { deletedAt: now },
    });
    return { deleted: true };
  },
};
