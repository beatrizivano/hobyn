import { prisma } from "../../clients/prisma.client.js";

const publicUserSelect = {
  id: true,
  nome: true,
  sobrenome: true,
  email: true,
  fotoDePerfil: true,
  createdAt: true,
  updatedAt: true,
};

export const userRepository = {
  findPhoto(id) {
    return prisma.usuario.findFirst({ where: { id, deletedAt: null }, select: { fotoDePerfil: true } });
  },
  findActiveById(id) {
    return prisma.usuario.findFirst({
      where: { id, deletedAt: null },
      select: publicUserSelect,
    });
  },

  updateProfile(id, data) {
    return prisma.usuario.update({
      where: { id },
      data,
      select: publicUserSelect,
    });
  },

  async updateProfileWithPrevious(id, data) {
    return prisma.$transaction(async transaction => {
      const current = await transaction.usuario.findFirstOrThrow({ where: { id, deletedAt: null }, select: { fotoDePerfil: true } });
      const user = await transaction.usuario.update({ where: { id }, data, select: publicUserSelect });
      return { user, previousPhoto: current.fotoDePerfil };
    });
  },

  async softDelete(id, now) {
    return prisma.$transaction(async transaction => {
      const user = await transaction.usuario.update({ where: { id }, data: { deletedAt: now }, select: { fotoDePerfil: true } });
      await transaction.session.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: now } });
      return user;
    });
  },
};
