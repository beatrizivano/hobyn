import { HttpError } from "../../shared/http-error.js";
import { recordRepository } from "./record.repository.js";

function activityDate(date) {
  return new Date(`${date}T00:00:00.000Z`);
}

function assertGroupWritable(group) {
  if (!group) {
    throw new HttpError("Grupo não encontrado ou usuário não é membro ativo.", 404);
  }
  if (group.endsAt && group.endsAt <= new Date()) {
    throw new HttpError("Este grupo foi encerrado e está somente para leitura.", 409);
  }
}

function scoreForRecord(group, duration, baseScore, cooperativeScore, isCooperative) {
  const baseValue = Number(baseScore.valor);
  if (!Number.isInteger(baseValue) || baseValue < 0) {
    throw new HttpError("A pontuação base configurada para registros é inválida.", 409);
  }
  let basePoints = baseValue;

  if (group.modoPontuacao === "tempo") {
    if (!baseScore.unidadeTempoMinutos || baseScore.unidadeTempoMinutos < 1) {
      throw new HttpError("A configuração de pontuação por tempo está inválida.", 409);
    }
    basePoints =
      Math.floor(duration / baseScore.unidadeTempoMinutos) * baseValue;
  }

  if (!isCooperative) {
    return { basePoints, bonusPoints: 0 };
  }
  const multiplier = Number(cooperativeScore?.valor);
  if (!cooperativeScore || !Number.isFinite(multiplier) || multiplier < 1) {
    throw new HttpError(
      "Configure um multiplicador decimal de pelo menos 1 em bonus_cooperativo.",
      409,
    );
  }

  const totalPoints = Math.floor(basePoints * multiplier);
  return { basePoints, bonusPoints: totalPoints - basePoints };
}

function throwForRecordResult(result) {
  if (result?.notFound) {
    throw new HttpError("Registro não encontrado.", 404);
  }
  if (result?.ended) {
    throw new HttpError("Este grupo foi encerrado e está somente para leitura.", 409);
  }
  if (result?.invalidMembers) {
    throw new HttpError("Todos os participantes precisam ser membros ativos do grupo.", 400);
  }
  if (result?.invalidHobby) {
    throw new HttpError("Hobby inativo ou não permitido neste grupo.", 400);
  }
  return result;
}

export const recordService = {
  async list(userId, query) {
    const group = await recordRepository.findGroupForUser(query.groupId, userId);
    if (!group) {
      throw new HttpError("Grupo não encontrado ou usuário não é membro ativo.", 404);
    }

    const rows = await recordRepository.listForGroup(query.groupId, query);
    const hasMore = rows.length > query.take;
    const items = hasMore ? rows.slice(0, query.take) : rows;

    return {
      items,
      nextCursor: hasMore ? items.at(-1).id : null,
    };
  },

  async get(userId, recordId) {
    const record = await recordRepository.findForUser(recordId, userId);
    if (!record) {
      throw new HttpError("Registro não encontrado.", 404);
    }
    return record;
  },

  async create(userId, input) {
    const userIds = [...new Set(input.userIds ?? [userId])];
    if (!userIds.includes(userId)) {
      throw new HttpError("O autor do registro deve estar entre os participantes.");
    }

    return recordRepository.transaction(async (transaction) => {
      const group = await recordRepository.findActiveGroup(
        transaction,
        input.groupId,
        userId,
      );
      assertGroupWritable(group);

      const hobby = await recordRepository.findActiveHobby(
        transaction,
        input.hobbyId,
      );
      if (
        !hobby ||
        (group.hobbiesPermitidos.length > 0 &&
          !group.hobbiesPermitidos.some(
            ({ hobbyId }) => hobbyId === input.hobbyId,
          ))
      ) {
        throw new HttpError("Hobby inativo ou não permitido neste grupo.", 400);
      }

      const memberships = await recordRepository.findActiveMemberships(
        transaction,
        input.groupId,
        userIds,
      );
      if (memberships.length !== userIds.length) {
        throw new HttpError(
          "Todos os participantes precisam ser membros ativos do grupo.",
        );
      }

      const date = activityDate(input.data);
      const scorableUserIds = [];
      const unscoredUserIds = [];

      for (const participantId of userIds) {
        const dailyCount = await recordRepository.countDailyRecords(
          transaction,
          input.groupId,
          participantId,
          date,
        );
        if (
          group.limiteRegistrosPorDia &&
          dailyCount >= group.limiteRegistrosPorDia
        ) {
          unscoredUserIds.push(participantId);
        } else {
          scorableUserIds.push(participantId);
        }
      }

      const logs = [];
      if (scorableUserIds.length > 0) {
        const mode = group.modoPontuacao === "registro" ? "fixo" : "porTempo";
        const baseScore = await recordRepository.findScore(
          transaction,
          "registro_hobby",
          mode,
        );
        if (!baseScore) {
          throw new HttpError(
            `A pontuação registro_hobby (${mode}) não está configurada.`,
            409,
          );
        }

        const isCooperative = userIds.length > 1;
        const cooperativeScore = isCooperative
          ? await recordRepository.findScore(
              transaction,
              "bonus_cooperativo",
              undefined,
            )
          : null;
        const scores = scoreForRecord(
          group,
          input.duracaoMinutos,
          baseScore,
          cooperativeScore,
          isCooperative,
        );

        for (const participantId of scorableUserIds) {
          logs.push({
            userId: participantId,
            groupId: input.groupId,
            pontuacaoId: baseScore.id,
            pontosGanhos: scores.basePoints,
            data: new Date(),
          });
          if (scores.bonusPoints > 0) {
            logs.push({
              userId: participantId,
              groupId: input.groupId,
              pontuacaoId: cooperativeScore.id,
              pontosGanhos: scores.bonusPoints,
              data: new Date(),
            });
          }
        }
      }

      const record = await recordRepository.createWithLogs(
        transaction,
        {
          ...input,
          data: date,
          groupId: input.groupId,
          criadoPorId: userId,
        },
        userIds,
        logs,
      );

      return {
        record,
        pontuadosUserIds: scorableUserIds,
        semPontuacaoUserIds: unscoredUserIds,
      };
    });
  },

  async update(userId, recordId, input) {
    const { data, userIds, ...fields } = input;
    if (userIds && !userIds.includes(userId)) {
      throw new HttpError(
        "O autor do registro deve continuar entre os participantes.",
      );
    }
    const result = await recordRepository.updateOwned(
      recordId,
      userId,
      {
        ...fields,
        ...(data ? { data: activityDate(data) } : {}),
      },
      userIds,
    );
    return throwForRecordResult(result);
  },

  async delete(userId, recordId) {
    const result = await recordRepository.deleteOwned(recordId, userId);
    throwForRecordResult(result);
  },
};
