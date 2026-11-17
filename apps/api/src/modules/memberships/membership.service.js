import { HttpError } from "../../shared/http-error.js";
import { membershipRepository } from "./membership.repository.js";

async function withRetry(action) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try { return await action(); }
    catch (error) {
      if (error?.code !== "P2034" || attempt === 3) {
        if (error?.code === "P2034") throw new HttpError("Houve uma alteração simultânea nos membros. Tente novamente.", 409);
        throw error;
      }
    }
  }
}

function commonErrors(result) {
  if (result.notFound) throw new HttpError("Grupo não encontrado.", 404);
  if (result.ended) throw new HttpError("Este grupo foi encerrado e está somente para leitura.", 409);
  return result;
}

export const membershipService = {
  async leave(groupId, userId) {
    const result = commonErrors(await withRetry(() => membershipRepository.leave(groupId, userId, new Date())));
    if (result.noSuccessor) throw new HttpError("Adicione outro membro antes de sair ou exclua o grupo. Um grupo não pode ficar sem administrador.", 409);
    return result;
  },
  async remove(groupId, adminId, targetUserId) {
    const result = commonErrors(await withRetry(() => membershipRepository.remove(groupId, adminId, targetUserId, new Date())));
    if (result.self) throw new HttpError("Para sair do grupo, use a opção Sair do grupo.", 400);
    if (result.targetNotFound) throw new HttpError("Membro não encontrado.", 404);
    if (result.adminTarget) throw new HttpError("O administrador deve sair pelo fluxo que transfere a administração.", 409);
  },
};
