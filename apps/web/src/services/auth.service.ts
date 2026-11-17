import type { Usuario } from '../types/domain';
import { api, ApiError, type Session } from './http.ts';

export const authService = {
  async restore() {
    try {
      await api.refresh();
      const user = await api.request<Usuario>('/auth/me');
      const session = api.getSession();
      if (session) api.setSession({ ...session, user });
    }
    catch (error) { if (!(error instanceof ApiError && error.status === 401)) throw error; }
  },
  async login(values: { email: string; senha: string }) {
    const result = await api.request<Session>('/auth/login', { method: 'POST', auth: false, body: { email: values.email, password: values.senha } });
    api.setSession(result);
  },
  async register(values: { nome: string; sobrenome: string; email: string; senha: string }) {
    const { senha, ...profile } = values;
    const result = await api.request<Session>('/auth/register', { method: 'POST', auth: false, body: { ...profile, password: senha } });
    api.setSession(result);
  },
  async logout() {
    await api.waitForRefresh();
    await api.request('/auth/logout', { method: 'POST', auth: false });
    api.setSession(null);
  },
  async deleteAccount() {
    await api.waitForRefresh();
    await api.request('/users/me', { method: 'DELETE' });
    api.setSession(null);
  },
  async updateProfile(values: { nome: string; sobrenome: string; foto: File | null }) {
    const body = new FormData();
    body.set('nome', values.nome);
    body.set('sobrenome', values.sobrenome);
    if (values.foto) body.set('foto', values.foto);
    const user = await api.request<Usuario>('/users/me', { method: 'PATCH', body });
    const session = api.getSession();
    if (session) api.setSession({ ...session, user });
    return user;
  },
};
