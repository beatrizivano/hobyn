import { HttpError } from "../../shared/http-error.js";
import { groupRepository } from "./group.repository.js";

function ensureNotPastEnd(endsAt) {
  if (endsAt && new Date(endsAt) <= new Date()) {
    throw new HttpError("A data de encerramento deve estar no futuro.");
  }
}

function throwForGroupResult(result) {
  if (result?.forbidden) {
    throw new HttpError(
      "Somente o administrador ativo pode alterar este grupo.",
      403,
    );
  }
  if (result?.ended) {
    throw new HttpError(
      "Este grupo foi encerrado e está somente para leitura.",
      409,
    );
  }
  if (result?.missingHobbies) {
    throw new HttpError("Um ou mais hobbies não existem ou estão inativos.", 400);
  }
  return result;
}

export const groupService = {
  async list(userId) {
    return groupRepository.listForUser(userId);
  },

  async get(userId, groupId) {
    const group = await groupRepository.findForUser(groupId, userId);
    if (!group) {
      throw new HttpError("Grupo não encontrado.", 404);
    }
    return group;
  },

  async create(userId, data) {
    ensureNotPastEnd(data.endsAt);
    return throwForGroupResult(
      await groupRepository.createForUser(userId, data),
    );
  },

  async update(userId, groupId, data) {
    ensureNotPastEnd(data.endsAt);
    const membership = await groupRepository.findActiveMembership(
      userId,
      groupId,
    );
    if (!membership) {
      throw new HttpError("Grupo não encontrado.", 404);
    }
    if (membership.papel !== "admin") {
      throw new HttpError(
        "Somente o administrador ativo pode alterar este grupo.",
        403,
      );
    }
    if (membership.grupo.endsAt && membership.grupo.endsAt <= new Date()) {
      throw new HttpError(
        "Este grupo foi encerrado e está somente para leitura.",
        409,
      );
    }

    const result = await groupRepository.updateForUser(groupId, userId, data);
    if (!result) {
      throw new HttpError("Grupo não encontrado.", 404);
    }
    return throwForGroupResult(result);
  },

  async delete(userId, groupId) {
    const membership = await groupRepository.findActiveMembership(
      userId,
      groupId,
    );
    if (!membership) {
      throw new HttpError("Grupo não encontrado.", 404);
    }
    if (membership.papel !== "admin") {
      throw new HttpError(
        "Somente o administrador ativo pode excluir este grupo.",
        403,
      );
    }
    if (membership.grupo.endsAt && membership.grupo.endsAt <= new Date()) {
      throw new HttpError(
        "Este grupo foi encerrado e está somente para leitura.",
        409,
      );
    }

    const result = await groupRepository.softDeleteForUser(
      groupId,
      userId,
      new Date(),
    );
    if (result.forbidden) {
      throw new HttpError(
        "Somente o administrador ativo pode excluir este grupo.",
        403,
      );
    }
    if (result.ended) {
      throw new HttpError(
        "Este grupo foi encerrado e está somente para leitura.",
        409,
      );
    }
  },
};
