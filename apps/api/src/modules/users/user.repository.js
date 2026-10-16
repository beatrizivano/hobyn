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

  async softDelete(id, now) {
    await prisma.$transaction([
      prisma.usuario.update({
        where: { id },
        data: { deletedAt: now },
      }),
      prisma.session.updateMany({
        where: { userId: id, revokedAt: null },
        data: { revokedAt: now },
      }),
    ]);
  },
};
