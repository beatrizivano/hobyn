import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { NovoGrupoInput, RankingEntry } from '../types/domain';
import { groupsService } from '../services/groups.service';
import { recordsService } from '../services/records.service';
import type { QueryState } from './queryState';

export function useGroups() { return useQuery({ queryKey: ['groups'], queryFn: ({ signal }) => groupsService.list(signal) }); }
export function useGroup(id: string) { return useQuery({ queryKey: ['groups', id], queryFn: ({ signal }) => groupsService.get(id, signal), enabled: !!id }); }
export function useCreateGroup() {
  const client = useQueryClient();
  return useMutation({ mutationFn: groupsService.create, onSuccess: async () => { await client.invalidateQueries({ queryKey: ['groups'] }); } });
}
export function useUpdateGroup(id: string) {
  const client = useQueryClient();
  return useMutation({ mutationFn: (input: NovoGrupoInput) => groupsService.update(id, input), onSuccess: async () => { await client.invalidateQueries({ queryKey: ['groups'] }); } });
}
export function useGroupFeed(groupId: string) {
  const query = useInfiniteQuery({
    queryKey: ['records', 'feed', groupId], initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) => recordsService.list(groupId, pageParam, signal),
    getNextPageParam: page => page.nextCursor ?? undefined, enabled: !!groupId,
  });
  return { ...query, data: query.data?.pages.flatMap(page => page.items) };
}
export function useGroupRanking(_groupId: string): QueryState<RankingEntry[]> {
  return { data: undefined, isLoading: false, error: new Error('O ranking estará disponível após a conclusão da consulta de pontuação.') };
}
