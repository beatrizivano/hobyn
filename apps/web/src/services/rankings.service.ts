import type { RankingEntry } from '../types/domain';
import { api } from './http.ts';

export const rankingsService = {
  list(groupId: string, signal?: AbortSignal) {
    return api.request<RankingEntry[]>(`/groups/${encodeURIComponent(groupId)}/ranking`, { signal });
  },
};
