import type { TagTone } from '../components/common/Tag';

const TONE_BY_HOBBY: Record<string, TagTone> = {
  leitura: 'green',
  arte: 'coral',
  cozinhar: 'green',
  'atividade fisica': 'neutral',
  outro: 'neutral',
};

const normalize = (name: string) =>
  name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

/** Cor da tag de um hobby. Hobbies fora do mapa ficam neutros (branco). */
export function hobbyTone(hobbyName: string): TagTone {
  return TONE_BY_HOBBY[normalize(hobbyName)] ?? 'neutral';
}
