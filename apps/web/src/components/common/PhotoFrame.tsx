import type { ReactNode } from 'react';
import { usePhoto } from '../../hooks/usePhoto';
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
  const photo = usePhoto(src);
  return (
    <div className={cx(styles.frame, className)} style={{ aspectRatio: ratio }}>
      {photo.src ? <img className={styles.image} src={photo.src} alt={alt} /> : <span className={styles.placeholder} aria-hidden="true" />}
      {(photo.isLoading || photo.error) && <span className={styles.status} role="status">{photo.error ? 'Não foi possível carregar a foto.' : 'Carregando foto…'}</span>}
      {children && <div className={styles.overlay}>{children}</div>}
    </div>
  );
}
