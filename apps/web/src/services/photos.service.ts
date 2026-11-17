import { api } from './http.ts';
export const isPrivatePhoto = (src?: string | null) => !!src && /^\/api\/records\/[^/]+\/photo$/.test(src);
export const photosService = {
  read(src: string, signal?: AbortSignal) {
    if (!isPrivatePhoto(src)) throw new Error('Endereço de foto inválido.');
    return api.request<Blob>(src.slice(4), { signal, responseType: 'blob' });
  },
};
