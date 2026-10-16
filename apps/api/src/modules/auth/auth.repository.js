import { prisma } from "../../clients/prisma.client.js";

const publicUserSelect = {
  id: true,
  nome: true,
  sobrenome: true,
  email: true,
  fotoDePerfil: true,
  createdAt: true,
};

export const authRepository = {
  findUserByEmail(email) {
    return prisma.usuario.findUnique({ where: { email } });
  },

  createUserWithSession({ userData, refreshTokenHash, expiresAt }) {
    return prisma.$transaction(async (transaction) => {
      const user = await transaction.usuario.create({
        data: userData,
        select: publicUserSelect,
      });

      await transaction.session.create({
        data: { userId: user.id, refreshTokenHash, expiresAt },
      });

      return user;
    });
  },

  createSession({ userId, refreshTokenHash, expiresAt }) {
    return prisma.session.create({
      data: { userId, refreshTokenHash, expiresAt },
    });
  },

  findSessionByRefreshTokenHash(refreshTokenHash) {
    return prisma.session.findUnique({
      where: { refreshTokenHash },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            sobrenome: true,
            email: true,
            fotoDePerfil: true,
            createdAt: true,
            deletedAt: true,
          },
        },
      },
    });
  },

  rotateSession({ id, currentHash, nextHash, now, expiresAt }) {
    return prisma.session.updateMany({
      where: {
        id,
        refreshTokenHash: currentHash,
        revokedAt: null,
        expiresAt: { gt: now },
      },
      data: { refreshTokenHash: nextHash, expiresAt },
    });
  },

  revokeSession(refreshTokenHash, revokedAt) {
    return prisma.session.updateMany({
      where: { refreshTokenHash, revokedAt: null },
      data: { revokedAt },
    });
  },
};
