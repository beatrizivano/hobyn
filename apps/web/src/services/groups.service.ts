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
function multipart(input: NovoGrupoInput) {
  const body = new FormData();
  body.set('nome', input.nome);
  body.set('descricao', input.descricao);
  body.set('modoPontuacao', input.modoPontuacao);
  body.set('limiteRegistrosPorDia', input.limiteRegistrosPorDia === null ? 'null' : String(input.limiteRegistrosPorDia));
  body.set('endsAt', input.endsAt ?? 'null');
  body.set('hobbyIds', JSON.stringify(input.hobbyIds));
  if (input.foto) body.set('foto', input.foto);
  return body;
}
export const groupsService = {
  async list(signal?: AbortSignal) { return (await api.request<GroupDto[]>('/groups', { signal })).map(groupView); },
  async get(id: string, signal?: AbortSignal) { return groupView(await api.request<GroupDto>(`/groups/${encodeURIComponent(id)}`, { signal })); },
  async update(id: string, input: NovoGrupoInput) {
    return groupView(await api.request<GroupDto>(`/groups/${encodeURIComponent(id)}`, { method: 'PATCH', body: multipart(input) }));
  },
  async create(input: NovoGrupoInput) {
    return groupView(await api.request<GroupDto>('/groups', { method: 'POST', body: multipart(input) }));
  },
};
