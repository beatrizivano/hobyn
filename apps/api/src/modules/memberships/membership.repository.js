import { prisma } from "../../clients/prisma.client.js";

export const membershipRepository = {
  leave(groupId, userId, now) {
    return prisma.$transaction(async transaction => {
      const membership = await transaction.usuarioGrupo.findFirst({
        where: { groupId, userId, saiuEm: null, grupo: { deletedAt: null }, usuario: { deletedAt: null } },
        select: { id: true, papel: true, grupo: { select: { endsAt: true } } },
      });
      if (!membership) return { notFound: true };
      if (membership.grupo.endsAt && membership.grupo.endsAt <= now) return { ended: true };

      let newAdminId = null;
      if (membership.papel === "admin") {
        const successor = await transaction.usuarioGrupo.findFirst({
          where: { groupId, userId: { not: userId }, papel: "membro", saiuEm: null, usuario: { deletedAt: null } },
          orderBy: [{ entrouEm: "asc" }, { id: "asc" }],
          select: { id: true, userId: true },
        });
        if (!successor) return { noSuccessor: true };
        await transaction.usuarioGrupo.update({ where: { id: successor.id }, data: { papel: "admin" } });
        newAdminId = successor.userId;
      }

      await transaction.usuarioGrupo.updateMany({ where: { groupId, userId, saiuEm: null }, data: { saiuEm: now } });
      return { left: true, newAdminId };
    }, { isolationLevel: "Serializable" });
  },

  remove(groupId, adminId, targetUserId, now) {
    return prisma.$transaction(async transaction => {
      const admin = await transaction.usuarioGrupo.findFirst({
        where: { groupId, userId: adminId, papel: "admin", saiuEm: null, grupo: { deletedAt: null }, usuario: { deletedAt: null } },
        select: { id: true, grupo: { select: { endsAt: true } } },
      });
      if (!admin) return { notFound: true };
      if (admin.grupo.endsAt && admin.grupo.endsAt <= now) return { ended: true };
      if (adminId === targetUserId) return { self: true };

      const target = await transaction.usuarioGrupo.findFirst({
        where: { groupId, userId: targetUserId, saiuEm: null, usuario: { deletedAt: null } },
        select: { id: true, papel: true },
      });
      if (!target) return { targetNotFound: true };
      if (target.papel === "admin") return { adminTarget: true };
      await transaction.usuarioGrupo.updateMany({ where: { groupId, userId: targetUserId, saiuEm: null }, data: { saiuEm: now } });
      return { removed: true };
    }, { isolationLevel: "Serializable" });
  },
};
