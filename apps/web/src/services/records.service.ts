import type { Hobby, Membro, NovoRegistroInput, Registro, RegistroFormInput } from '../types/domain';
import { api } from './http.ts';
interface RecordDto extends Omit<Registro, 'grupoId' | 'autores' | 'curtidas' | 'data'> {
  groupId: string;
  grupo?: { endsAt: string | null };
  data: string;
  usuarios: { usuario: Membro }[];
}
function recordView(record: RecordDto): Registro {
  return { ...record, grupoId: record.groupId, data: record.data.slice(0, 10), autores: record.usuarios.map(row => row.usuario), curtidas: null, grupoEncerrado: !!record.grupo?.endsAt && new Date(record.grupo.endsAt) <= new Date() };
}
function multipart(input: RegistroFormInput, create: boolean) {
  const currentUserId = api.getSession()?.user.id;
  if (!currentUserId) throw new Error('Entre novamente para salvar o registro.');
  const data = new FormData();
  if (create) data.set('groupId', input.grupoId);
  data.set('hobbyId', input.hobbyId);
  data.set('data', input.data);
  data.set('duracaoMinutos', String(input.duracaoMinutos));
  data.set('descricao', input.descricao);
  data.set('userIds', JSON.stringify([currentUserId, ...input.participanteIds]));
  if (input.foto) data.set('foto', input.foto);
  return data;
}
export interface CreatedRecord { record: Registro; pontuadosUserIds: string[]; semPontuacaoUserIds: string[] }
export const recordsService = {
  async create(input: NovoRegistroInput): Promise<CreatedRecord> {
    const result = await api.request<{ record: RecordDto; pontuadosUserIds: string[]; semPontuacaoUserIds: string[] }>('/records', { method: 'POST', body: multipart(input, true) });
    return { ...result, record: recordView(result.record) };
  },
  async update(id: string, input: RegistroFormInput) {
    return recordView(await api.request<RecordDto>(`/records/${encodeURIComponent(id)}`, { method: 'PATCH', body: multipart(input, false) }));
  },
  remove(id: string) { return api.request<void>(`/records/${encodeURIComponent(id)}`, { method: 'DELETE' }); },
  async get(id: string, signal?: AbortSignal) { return recordView(await api.request<RecordDto>(`/records/${encodeURIComponent(id)}`, { signal })); },
  async list(groupId: string, cursor?: string, signal?: AbortSignal) {
    const query = new URLSearchParams({ groupId, take: '20', ...(cursor ? { cursor } : {}) });
    const page = await api.request<{ items: RecordDto[]; nextCursor: string | null }>(`/records?${query}`, { signal });
    return { ...page, items: page.items.map(recordView) };
  },
  catalog(signal?: AbortSignal) { return api.request<Hobby[]>('/hobbies', { signal }); },
};
