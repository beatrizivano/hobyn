import assert from 'node:assert/strict';
import test from 'node:test';
import { ApiError, createApiClient } from './http.ts';

const user = { id: 'user-1', nome: 'Ana', sobrenome: 'Teste', email: 'ana@example.com', fotoDePerfil: null, createdAt: '2026-11-17' };
const session = token => ({ accessToken: token, user });
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

test('envia credenciais, JSON e bearer em chamadas privadas', async () => {
  const client = createApiClient('/api/', async (url, init) => {
    assert.equal(url, '/api/groups');
    assert.equal(init.credentials, 'include');
    assert.equal(init.headers.get('Authorization'), 'Bearer token');
    assert.equal(init.headers.get('Content-Type'), 'application/json');
    assert.deepEqual(JSON.parse(init.body), { nome: 'Grupo' });
    return json({ id: 'group-1' }, 201);
  });
  client.setSession(session('token'));
  assert.deepEqual(await client.request('/groups', { method: 'POST', body: { nome: 'Grupo' } }), { id: 'group-1' });
});

test('401 simultâneos compartilham um refresh e repetem com o token renovado', async () => {
  let refreshes = 0;
  let retries = 0;
  const client = createApiClient('/api', async (url, init) => {
    if (url.endsWith('/auth/refresh')) {
      refreshes += 1;
      await new Promise(resolve => setTimeout(resolve, 10));
      return json(session('new'));
    }
    if (init.headers.get('Authorization') === 'Bearer old') return json({ error: 'Expirado' }, 401);
    assert.equal(init.headers.get('Authorization'), 'Bearer new');
    retries += 1;
    return json({ ok: true });
  });
  client.setSession(session('old'));
  await Promise.all([client.request('/groups'), client.request('/hobbies')]);
  assert.equal(refreshes, 1);
  assert.equal(retries, 2);
});

test('erro de login não dispara refresh nem é mascarado', async () => {
  let calls = 0;
  const client = createApiClient('/api', async url => {
    calls += 1;
    assert.equal(url, '/api/auth/login');
    return json({ error: 'Credenciais inválidas', details: [{ field: 'email', message: 'Inválido' }] }, 401);
  });
  await assert.rejects(client.request('/auth/login', { auth: false, method: 'POST' }), error => error instanceof ApiError && error.status === 401 && error.details[0].field === 'email');
  assert.equal(calls, 1);
});

test('refresh inválido encerra a sessão sem loop', async () => {
  let calls = 0;
  const client = createApiClient('/api', async () => { calls += 1; return json({ error: 'Sessão expirada' }, 401); });
  client.setSession(session('old'));
  await assert.rejects(client.request('/groups'), error => error.status === 401);
  assert.equal(client.getSession(), null);
  assert.equal(calls, 2);
});

test('falha de rede no refresh preserva a sessão para nova tentativa', async () => {
  const client = createApiClient('/api', async url => {
    if (url.endsWith('/auth/refresh')) throw new TypeError('Network failed');
    return json({}, 401);
  });
  client.setSession(session('old'));
  await assert.rejects(client.request('/groups'), error => error.status === 0);
  assert.equal(client.getSession().accessToken, 'old');
});

test('refresh atrasado não restaura uma sessão encerrada', async () => {
  let complete;
  const client = createApiClient('/api', () => new Promise(resolve => { complete = resolve; }));
  client.setSession(session('old'));
  const refreshing = client.refresh();
  client.setSession(null);
  complete(json(session('new')));
  await assert.rejects(refreshing, error => error.status === 401);
  assert.equal(client.getSession(), null);
});

test('204 é aceito e cancelamento continua identificado como cancelamento', async () => {
  const client = createApiClient('/api', async () => new Response(null, { status: 204 }));
  assert.equal(await client.request('/auth/logout', { auth: false }), undefined);
  const aborted = createApiClient('/api', async () => { throw new DOMException('Aborted', 'AbortError'); });
  await assert.rejects(aborted.request('/groups'), error => error.name === 'AbortError');
});
