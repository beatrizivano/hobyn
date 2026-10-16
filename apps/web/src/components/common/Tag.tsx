import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import styles from './Tag.module.css';

export type TagTone = 'neutral' | 'green' | 'coral';

interface TagProps {
  tone?: TagTone;
  className?: string;
  children: ReactNode;
}

export function Tag({ tone = 'neutral', className, children }: TagProps) {
  return <span className={cx(styles.tag, styles[tone], className)}>{children}</span>;
}
