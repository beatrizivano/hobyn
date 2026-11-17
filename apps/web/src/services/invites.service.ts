import { api } from './http.ts';

export interface GroupInvite { codigo: string; expiresAt: string }
export interface JoinInviteResult { groupId: string; alreadyMember: boolean }

export const invitesService = {
  get: (groupId: string, signal?: AbortSignal) => api.request<GroupInvite | null>(`/groups/${encodeURIComponent(groupId)}/invite`, { signal }),
  generate: (groupId: string) => api.request<GroupInvite>(`/groups/${encodeURIComponent(groupId)}/invite`, { method: 'POST' }),
  join: (codigo: string) => api.request<JoinInviteResult>('/invites/join', { method: 'POST', body: { codigo } }),
};
