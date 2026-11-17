import assert from 'node:assert/strict';
import test from 'node:test';
import { isPrivatePhoto } from './photos.service.ts';

test('reconhece somente endpoints privados de fotos da aplicação', () => {
  assert.equal(isPrivatePhoto('/api/records/registro-1/photo'), true);
  assert.equal(isPrivatePhoto('/api/users/usuario-1/photo?v=2026-11-17'), true);
  assert.equal(isPrivatePhoto('/api/groups/grupo-1/photo?v=2'), true);
  assert.equal(isPrivatePhoto('/api/users/usuario-1'), false);
  assert.equal(isPrivatePhoto('https://example.com/foto.webp'), false);
  assert.equal(isPrivatePhoto('/api/groups/../photo'), false);
});
