import { PixelSprite } from '../../../components/common';
import { cx } from '../../../utils/cx';
import { spriteForBadge } from '../data/sprites';
import styles from './BadgeTile.module.css';

interface BadgeTileProps {
  nome: string;
  earned: boolean;
  selected: boolean;
  onSelect: () => void;
}

/** Conquistada: círculo branco com sombra. Bloqueada: círculo tracejado, sprite em cinza. */
export function BadgeTile({ nome, earned, selected, onSelect }: BadgeTileProps) {
  return (
    <button
      type="button"
      className={cx(styles.tile, selected && styles.selected)}
      aria-pressed={selected}
      aria-label={`${nome}, ${earned ? 'conquistada' : 'ainda não conquistada'}`}
      onClick={onSelect}
    >
      <span className={cx(styles.medal, earned ? styles.earned : styles.locked)}>
        <PixelSprite rows={spriteForBadge(nome)} pixel={5} />
      </span>
      <span className={styles.name}>{nome}</span>
    </button>
  );
}
