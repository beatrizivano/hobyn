import { cx } from '../../utils/cx';
import { initials } from '../../utils/format';
import styles from './Avatar.module.css';

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  return (
    <span className={cx(styles.avatar, styles[size], className)} role="img" aria-label={name}>
      {src ? <img className={styles.image} src={src} alt="" /> : <span aria-hidden="true">{initials(name)}</span>}
    </span>
  );
}
