import { randomBytes } from "node:crypto";
import { INVITE_CODE_ALPHABET, INVITE_CODE_LENGTH, INVITE_TTL_DAYS } from "shared";
import { HttpError } from "../../shared/http-error.js";
import { inviteRepository } from "./invite.repository.js";

const MAX_TRANSACTION_ATTEMPTS = 3;

function createCode() {
  return Array.from(randomBytes(INVITE_CODE_LENGTH), (byte) => INVITE_CODE_ALPHABET[byte & 31]).join("");
}

function ensureOpen(group, statusCode = 409) {
  const now = new Date();
  if (group.deletedAt || (group.endsAt && group.endsAt <= now)) {
    throw new HttpError("Este grupo foi encerrado e está somente para leitura.", statusCode);
  }
  return now;
}

function inviteExpiration(group, now) {
  const expiresAt = new Date(now.getTime() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);
  return group.endsAt && group.endsAt < expiresAt ? group.endsAt : expiresAt;
}

async function withRetry(work) {
  for (let attempt = 1; attempt <= MAX_TRANSACTION_ATTEMPTS; attempt += 1) {
    try { return await inviteRepository.transaction(work); }
    catch (error) {
      if (!["P2002", "P2034"].includes(error?.code) || attempt === MAX_TRANSACTION_ATTEMPTS) {
        if (["P2002", "P2034"].includes(error?.code)) throw new HttpError("Conflito ao processar o convite. Tente novamente.", 409);
        throw error;
      }
    }
  }
}

function requireAdmin(membership) {
  if (!membership) throw new HttpError("Grupo não encontrado.", 404);
  if (membership.papel !== "admin") throw new HttpError("Somente o administrador pode gerenciar convites.", 403);
}

export const inviteService = {
  get(userId, groupId) {
    return inviteRepository.transaction(async (repository) => {
      const membership = await repository.findMembership(userId, groupId);
      requireAdmin(membership);
      ensureOpen(membership.grupo);
      return repository.findInviteByGroup(groupId);
    });
  },

  generate(userId, groupId) {
    return withRetry(async (repository) => {
      const membership = await repository.findMembership(userId, groupId);
      requireAdmin(membership);
      const now = ensureOpen(membership.grupo);
      return repository.saveInvite(groupId, userId, createCode(), inviteExpiration(membership.grupo, now));
    });
  },

  join(userId, codigo) {
    return withRetry(async (repository) => {
      const invite = await repository.findInviteByCode(codigo);
      if (!invite) throw new HttpError("Convite inválido.", 404);
      const now = ensureOpen(invite.grupo, 410);
      if (invite.expiresAt <= now) throw new HttpError("Este convite expirou.", 410);

      const membership = await repository.findMembership(userId, invite.groupId);
      if (membership) return { groupId: invite.groupId, alreadyMember: true };

      await repository.addMember(userId, invite.groupId);
      return { groupId: invite.groupId, alreadyMember: false };
    });
  },
};
