import { useMemo, type CSSProperties } from 'react';
import styles from './PixelSprite.module.css';

interface PixelSpriteProps {
  /** Uma string por linha; "#" pinta o pixel, qualquer outro caractere deixa vazio. */
  rows: readonly string[];
  /** Tamanho de cada pixel em px. */
  pixel?: number;
  /** Se informado, vira o texto alternativo; senão o sprite é decorativo. */
  label?: string;
}

/**
 * Pixel art em CSS puro: um único elemento 1×1 que desenha todos os pixels
 * como `box-shadow` com deslocamento. A cor vem de `currentColor`.
 */
export function PixelSprite({ rows, pixel = 5, label }: PixelSpriteProps) {
  const cols = Math.max(...rows.map((row) => row.length));
  const shadow = useMemo(() => {
    const parts: string[] = [];
    rows.forEach((row, y) =>
      [...row].forEach((char, x) => {
        if (char === '#') parts.push(`calc(var(--px) * ${x + 1}) calc(var(--px) * ${y + 1}) 0 0 currentColor`);
      }),
    );
    return parts.join(',');
  }, [rows]);

  const vars = { '--px': `${pixel}px`, '--cols': cols, '--rows': rows.length } as CSSProperties;

  return (
    <span className={styles.sprite} style={vars} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <i className={styles.dot} style={{ boxShadow: shadow }} />
    </span>
  );
}
