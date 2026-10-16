/**
 * Pixel art 8×8 das conquistas. "#" = pixel pintado.
 * Para uma nova conquista: adicionar o sprite aqui e mapear o nome em BADGE_SPRITE_BY_NAME.
 */
export type Sprite = readonly string[];

export const SPRITES = {
  crown: ['........', '#..##..#', '##.##.##', '########', '########', '.######.', '........', '........'],
  target: ['..####..', '.#....#.', '#..##..#', '#.#..#.#', '#.#..#.#', '#..##..#', '.#....#.', '..####..'],
  flame: ['...##...', '..###...', '..####.#', '.#####.#', '.#######', '.#######', '..#####.', '...###..'],
  sparkle: ['...##...', '...##...', '.######.', '########', '########', '.######.', '...##...', '...##...'],
  chefHat: ['.##..##.', '########', '########', '########', '.######.', '.######.', '.######.', '........'],
  dumbbell: ['........', '.#....#.', '###..###', '########', '########', '###..###', '.#....#.', '........'],
  book: ['.######.', '.#....#.', '.#.##.#.', '.#....#.', '.#.##.#.', '.#....#.', '.######.', '........'],
  brush: ['......##', '.....##.', '....##..', '...##...', '..###...', '.####...', '.###....', '........'],
  heart: ['.##..##.', '########', '########', '########', '.######.', '..####..', '...##...', '........'],
  trophy: ['########', '#.####.#', '#.####.#', '.######.', '..####..', '...##...', '...##...', '.######.'],
  podium: ['........', '...##...', '...##...', '#####...', '########', '########', '########', '........'],
  hourglass: ['########', '.######.', '..####..', '...##...', '...##...', '..####..', '.######.', '########'],
} as const satisfies Record<string, Sprite>;

const BADGE_SPRITE_BY_NAME: Record<string, keyof typeof SPRITES> = {
  lider: 'crown',
  focado: 'target',
  'muito focado': 'flame',
  'de tudo um pouco': 'sparkle',
  chef: 'chefHat',
  atleta: 'dumbbell',
  leitor: 'book',
  artista: 'brush',
  amigo: 'heart',
  'n.1': 'trophy',
  podio: 'podium',
  concentrado: 'hourglass',
};

const normalize = (name: string) =>
  name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

/** Sprite da conquista pelo nome; conquistas novas sem sprite usam o brilho. */
export function spriteForBadge(name: string): Sprite {
  return SPRITES[BADGE_SPRITE_BY_NAME[normalize(name)] ?? 'sparkle'];
}
