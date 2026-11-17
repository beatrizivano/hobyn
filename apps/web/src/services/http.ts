import type { Usuario } from '../types/domain';

export interface Session { accessToken: string; user: Usuario }
export class ApiError extends Error {
  status: number;
  details: { field: string; message: string }[];
  constructor(message: string, status: number, details: { field: string; message: string }[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}
interface Options extends Omit<RequestInit, 'body'> { body?: unknown; auth?: boolean; responseType?: 'json' | 'blob' }

export function createApiClient(baseUrl = '/api', fetcher: typeof fetch = (...args) => fetch(...args)) {
  let session: Session | null = null;
  let refreshPromise: Promise<Session> | null = null;
  let revision = 0;
  const listeners = new Set<() => void>();
  const setSession = (next: Session | null) => {
    revision += 1;
    session = next;
    listeners.forEach(listener => listener());
  };
  async function send<T>(path: string, options: Options, token: string | null): Promise<T> {
    const { body, auth: _auth, responseType, ...init } = options;
    const headers = new Headers(init.headers);
    if (token) headers.set('Authorization', `Bearer ${token}`);
    if (body !== undefined && !(body instanceof FormData)) headers.set('Content-Type', 'application/json');
    let response: Response;
    try {
      response = await fetcher(`${baseUrl.replace(/\/$/, '')}${path}`, {
        ...init, headers, credentials: 'include',
        ...(body !== undefined ? { body: body instanceof FormData ? body : JSON.stringify(body) } : {}),
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') throw error;
      throw new ApiError('Não foi possível conectar ao servidor. Tente novamente.', 0);
    }
    const payload = response.status === 204 ? undefined : response.ok && responseType === 'blob' ? await response.blob() : await response.json().catch(() => undefined);
    if (!response.ok) throw new ApiError(payload?.error ?? 'Não foi possível concluir a solicitação.', response.status, payload?.details);
    return payload as T;
  }
  const refresh = () => {
    if (!refreshPromise) {
      const startedAt = revision;
      refreshPromise = send<Session>('/auth/refresh', { method: 'POST' }, null)
        .then(result => {
          if (revision !== startedAt) {
            if (session) return session;
            throw new ApiError('Sessão encerrada.', 401);
          }
          setSession(result);
          return result;
        }).catch(error => {
          if (error instanceof ApiError && error.status === 401 && revision === startedAt) setSession(null);
          throw error;
        }).finally(() => { refreshPromise = null; });
    }
    return refreshPromise;
  };
  async function request<T>(path: string, options: Options = {}): Promise<T> {
    const token = options.auth === false ? null : session?.accessToken ?? null;
    try { return await send<T>(path, options, token); }
    catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401 || options.auth === false) throw error;
      const renewed = session && session.accessToken !== token ? session : await refresh();
      try { return await send<T>(path, options, renewed.accessToken); }
      catch (retryError) {
        if (retryError instanceof ApiError && retryError.status === 401) setSession(null);
        throw retryError;
      }
    }
  }
  return {
    request, refresh, setSession,
    getSession: () => session,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    waitForRefresh: async () => { if (refreshPromise) await refreshPromise.catch(() => undefined); },
  };
}
export const api = createApiClient(import.meta.env?.VITE_API_BASE_URL || '/api');
export const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'Não foi possível concluir. Tente novamente.';
