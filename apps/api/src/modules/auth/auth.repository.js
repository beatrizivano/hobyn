import { prisma } from "../../clients/prisma.client.js";

const publicUserSelect = {
  id: true,
  nome: true,
  sobrenome: true,
  email: true,
  fotoDePerfil: true,
  createdAt: true,
  updatedAt: true,
  emailVerificadoEm: true,
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

      const session = await transaction.session.create({
        data: { userId: user.id, refreshTokenHash, expiresAt },
        select: { id: true },
      });

      return { user, sessionId: session.id };
    });
  },
  createUser(userData) {
    return prisma.usuario.create({ data: userData, select: publicUserSelect });
  },

  createSession({ userId, refreshTokenHash, expiresAt }) {
    return prisma.session.create({
      data: { userId, refreshTokenHash, expiresAt },
    });
  },

  async findActiveSessionUser(userId, sessionId, now) {
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        userId,
        revokedAt: null,
        expiresAt: { gt: now },
        usuario: { deletedAt: null },
      },
      select: { usuario: { select: publicUserSelect } },
    });
    return session?.usuario ?? null;
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
            updatedAt: true,
            emailVerificadoEm: true,
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
