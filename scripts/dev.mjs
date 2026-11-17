import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const apiRequire = createRequire(new URL('apps/api/package.json', root));
const webRequire = createRequire(new URL('apps/web/package.json', root));
const services = [
  { name: 'API', cwd: 'apps/api/', cli: apiRequire.resolve('tsx/cli'), args: ['watch', 'src/server.js'] },
  { name: 'Web', cwd: 'apps/web/', cli: join(dirname(webRequire.resolve('vite/package.json')), 'bin/vite.js'), args: ['--host', '127.0.0.1', '--port', '5173', '--strictPort'] },
];
const children = [];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  process.exitCode = code;
  for (const child of children) child.kill();
}
for (const service of services) {
  const child = spawn(process.execPath, [service.cli, ...service.args], {
    cwd: fileURLToPath(new URL(service.cwd, root)), stdio: 'inherit',
  });
  children.push(child);
  child.on('error', (error) => { console.error(`${service.name}: ${error.message}`); stop(1); });
  child.on('exit', (code) => { if (!stopping) stop(code ?? 1); });
}
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
