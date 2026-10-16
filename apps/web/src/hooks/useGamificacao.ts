import { conquistas, desafioDaSemana, perfilStats } from '../mocks/data';
import type { Conquista, PerfilStats, WeeklyChallengeState } from '../types/domain';
import { ready, type QueryState } from './queryState';

export function useBadges(): QueryState<Conquista[]> {
  return ready(conquistas);
}

export function useWeeklyChallenge(): QueryState<WeeklyChallengeState> {
  return ready({ state: 'active', desafio: desafioDaSemana });
}

/** Stats do perfil: registros, horas, desafios, grupos anteriores. */
export function useUserStats(): QueryState<PerfilStats> {
  return ready(perfilStats);
}
