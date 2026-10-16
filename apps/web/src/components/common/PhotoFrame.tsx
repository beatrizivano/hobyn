import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import styles from './PhotoFrame.module.css';

interface PhotoFrameProps {
  src?: string | null;
  alt?: string;
  /** Proporção CSS (ex.: "16 / 9"). */
  ratio?: string;
  className?: string;
  /** Conteúdo sobreposto (ex.: pilha de avatares). */
  children?: ReactNode;
}

/** Moldura de foto com dither retrô quando ainda não há imagem. */
export function PhotoFrame({ src, alt = '', ratio = '16 / 9', className, children }: PhotoFrameProps) {
  return (
    <div className={cx(styles.frame, className)} style={{ aspectRatio: ratio }}>
      {src ? <img className={styles.image} src={src} alt={alt} /> : <span className={styles.placeholder} aria-hidden="true" />}
      {children && <div className={styles.overlay}>{children}</div>}
    </div>
  );
}
