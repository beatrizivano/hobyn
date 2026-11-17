import type { Grupo, Hobby, Membro, NovoGrupoInput } from '../types/domain';
import { api } from './http.ts';

interface GroupDto extends Omit<Grupo, 'membros' | 'hobbiesPermitidos' | 'codigoConvite'> {
  hobbiesPermitidos: { hobby: Hobby }[];
  usuarios: { userId: string; papel: 'admin' | 'membro'; usuario: Membro }[];
}
function groupView(group: GroupDto): Grupo {
  return {
    ...group,
    hobbiesPermitidos: group.hobbiesPermitidos.map(row => row.hobby),
    membros: group.usuarios.map(row => row.usuario),
    meuPapel: group.usuarios.find(row => row.userId === api.getSession()?.user.id)?.papel,
    codigoConvite: null,
  };
}
export const groupsService = {
  async list(signal?: AbortSignal) { return (await api.request<GroupDto[]>('/groups', { signal })).map(groupView); },
  async get(id: string, signal?: AbortSignal) { return groupView(await api.request<GroupDto>(`/groups/${encodeURIComponent(id)}`, { signal })); },
  async update(id: string, input: NovoGrupoInput) {
    if (input.foto) throw new Error('O envio de foto do grupo ainda não está disponível.');
    const { foto: _foto, ...body } = input;
    return groupView(await api.request<GroupDto>(`/groups/${encodeURIComponent(id)}`, { method: 'PATCH', body }));
  },
  async create(input: NovoGrupoInput) {
    if (input.foto) throw new Error('O envio de foto do grupo ainda não está disponível. Crie o grupo sem foto.');
    const { foto: _foto, ...body } = input;
    return groupView(await api.request<GroupDto>('/groups', { method: 'POST', body }));
  },
};
