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
  async register(values: { nome: string; sobrenome: string; email: string; senha: string; confirmarSenha?: string }) {
    const { senha, confirmarSenha: _confirmarSenha, ...profile } = values;
    const result = await api.request<(Session & { activationRequired: false }) | { activationRequired: true; email: string }>('/auth/register', { method: 'POST', auth: false, body: { ...profile, password: senha } });
    if (!result.activationRequired) api.setSession(result);
    return result;
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
  requestPasswordReset(email: string) { return api.request<{ message: string }>('/auth/password/forgot', { method: 'POST', auth: false, body: { email } }); },
  async resetPassword(token: string, password: string) { await api.request<void>('/auth/password/reset', { method: 'POST', auth: false, body: { token, password } }); api.setSession(null); },
  activateAccount(token: string) { return api.request<void>('/auth/activate', { method: 'POST', auth: false, body: { token } }); },
  resendActivation(email: string) { return api.request<{ message: string }>('/auth/activate/resend', { method: 'POST', auth: false, body: { email } }); },
  requestPasswordChange() { return api.request<{ message: string }>('/auth/password/change/request', { method: 'POST' }); },
  async confirmPasswordChange(token: string, currentPassword: string, password: string) {
    await api.request<void>('/auth/password/change/confirm', { method: 'POST', body: { token, currentPassword, password } });
    api.setSession(null);
  },
};
