import { grupos, rankings, registros } from '../mocks/data';
import type { Grupo, RankingEntry, Registro } from '../types/domain';
import { ready, type QueryState } from './queryState';

export function useGroups(): QueryState<Grupo[]> {
  return ready(grupos);
}

export function useGroup(groupId: string): QueryState<Grupo> {
  return ready(grupos.find((g) => g.id === groupId));
}

export function useGroupFeed(groupId: string): QueryState<Registro[]> {
  return ready(registros.filter((r) => r.grupoId === groupId));
}

/** View de ranking: pontuação somada de logAtividades, ordenada, só membros ativos. */
export function useGroupRanking(groupId: string): QueryState<RankingEntry[]> {
  return ready(rankings[groupId] ?? []);
}
