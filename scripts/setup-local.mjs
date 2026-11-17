import { randomBytes } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
for (const relative of ['.env', 'apps/api/.env']) {
  const template = await readFile(new URL(`${relative}.example`, root), 'utf8');
  const content = template.replace('GENERATE_WITH_SETUP_LOCAL', randomBytes(48).toString('hex'));
  try {
    await writeFile(new URL(relative, root), content, { flag: 'wx', mode: 0o600 });
    console.info(`Criado ${relative}.`);
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    console.info(`Preservado ${relative} existente.`);
  }
}
console.info('Se mudar o MySQL no .env da raiz, ajuste DATABASE_URL em apps/api/.env.');
