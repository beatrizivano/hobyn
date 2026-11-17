import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { invitesService } from '../services/invites.service';

export function useGroupInvite(groupId: string, enabled: boolean) {
  return useQuery({ queryKey: ['group-invite', groupId], queryFn: ({ signal }) => invitesService.get(groupId, signal), enabled: enabled && !!groupId });
}
export function useGenerateInvite(groupId: string) {
  const client = useQueryClient();
  return useMutation({ mutationFn: () => invitesService.generate(groupId), onSuccess: invite => client.setQueryData(['group-invite', groupId], invite) });
}
export function useJoinInvite() {
  const client = useQueryClient();
  return useMutation({ mutationFn: invitesService.join, onSuccess: async result => {
    await Promise.all([client.invalidateQueries({ queryKey: ['groups'] }), client.invalidateQueries({ queryKey: ['records', 'feed', result.groupId] })]);
  } });
}
