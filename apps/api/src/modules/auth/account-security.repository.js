import { prisma } from "../../clients/prisma.client.js";

export const accountSecurityRepository = {
  findActiveUserByEmail(email) {
    return prisma.usuario.findFirst({ where: { email, deletedAt: null }, select: { id: true, email: true, nome: true, emailVerificadoEm: true } });
  },
  findUserWithPassword(id) {
    return prisma.usuario.findFirst({ where: { id, deletedAt: null }, select: { id: true, email: true, nome: true, hashSenha: true } });
  },
  async replaceToken(userId, tipo, tokenHash, expiresAt, now) {
    return prisma.$transaction(async transaction => {
      await transaction.tokenEmail.updateMany({ where: { userId, tipo, consumedAt: null }, data: { consumedAt: now } });
      return transaction.tokenEmail.create({ data: { userId, tipo, tokenHash, expiresAt }, select: { id: true } });
    });
  },
  findValidToken(tokenHash, tipo, now) {
    return prisma.tokenEmail.findFirst({ where: { tokenHash, tipo, consumedAt: null, expiresAt: { gt: now }, usuario: { deletedAt: null } }, include: { usuario: true } });
  },
  async activate(tokenId, userId, now) {
    return prisma.$transaction(async transaction => {
      const consumed = await transaction.tokenEmail.updateMany({ where: { id: tokenId, userId, consumedAt: null, expiresAt: { gt: now } }, data: { consumedAt: now } });
      if (consumed.count !== 1) return false;
      await transaction.usuario.update({ where: { id: userId }, data: { emailVerificadoEm: now } });
      return true;
    }, { isolationLevel: "Serializable" });
  },
  async changePassword(tokenId, userId, passwordHash, now) {
    return prisma.$transaction(async transaction => {
      const consumed = await transaction.tokenEmail.updateMany({ where: { id: tokenId, userId, consumedAt: null, expiresAt: { gt: now } }, data: { consumedAt: now } });
      if (consumed.count !== 1) return false;
      await transaction.usuario.update({ where: { id: userId }, data: { hashSenha: passwordHash } });
      await transaction.session.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: now } });
      await transaction.tokenEmail.updateMany({ where: { userId, consumedAt: null }, data: { consumedAt: now } });
      return true;
    }, { isolationLevel: "Serializable" });
  },
};
