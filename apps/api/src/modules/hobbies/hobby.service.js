import { HttpError } from "../../shared/http-error.js";
import { hobbyRepository } from "./hobby.repository.js";

export const hobbyService = {
  async list(userId, groupId) {
    if (!groupId) {
      return hobbyRepository.listAllActive();
    }

    const group = await hobbyRepository.findActiveGroupForUser(userId, groupId);
    if (!group) {
      throw new HttpError("Grupo não encontrado ou usuário não é membro ativo.", 404);
    }

    if (group.hobbiesPermitidos.length === 0) {
      return hobbyRepository.listAllActive();
    }

    return hobbyRepository.listByIds(
      group.hobbiesPermitidos.map(({ hobbyId }) => hobbyId),
    );
  },
};
