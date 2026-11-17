import { cx } from '../../utils/cx';
import { initials } from '../../utils/format';
import styles from './Avatar.module.css';
import { usePhoto } from '../../hooks/usePhoto';

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const photo = usePhoto(src);
  return (
    <span className={cx(styles.avatar, styles[size], className)} role="img" aria-label={name}>
      {photo.src ? <img className={styles.image} src={photo.src} alt="" /> : <span aria-hidden="true">{initials(name)}</span>}
    </span>
  );
}
