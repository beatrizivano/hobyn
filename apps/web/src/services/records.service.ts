import type { Hobby, Membro, Registro } from '../types/domain';
import { api } from './http.ts';
interface RecordDto extends Omit<Registro, 'grupoId' | 'autores' | 'curtidas' | 'data'> {
  groupId: string;
  data: string;
  usuarios: { usuario: Membro }[];
}
function recordView(record: RecordDto): Registro {
  return { ...record, grupoId: record.groupId, data: record.data.slice(0, 10), autores: record.usuarios.map(row => row.usuario), curtidas: null };
}
export const recordsService = {
  async get(id: string, signal?: AbortSignal) { return recordView(await api.request<RecordDto>(`/records/${encodeURIComponent(id)}`, { signal })); },
  async list(groupId: string, cursor?: string, signal?: AbortSignal) {
    const query = new URLSearchParams({ groupId, take: '20', ...(cursor ? { cursor } : {}) });
    const page = await api.request<{ items: RecordDto[]; nextCursor: string | null }>(`/records?${query}`, { signal });
    return { ...page, items: page.items.map(recordView) };
  },
  catalog(signal?: AbortSignal) { return api.request<Hobby[]>('/hobbies', { signal }); },
};
