import { api } from './http.ts';
export const isPrivatePhoto = (src?: string | null) => !!src && /^\/api\/(?:records|users|groups)\/[A-Za-z0-9_-]{1,64}\/photo(?:\?.*)?$/.test(src);
export const photosService = {
  read(src: string, signal?: AbortSignal) {
    if (!isPrivatePhoto(src)) throw new Error('Endereço de foto inválido.');
    return api.request<Blob>(src.slice(4), { signal, responseType: 'blob' });
  },
};
