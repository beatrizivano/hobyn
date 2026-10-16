import type { ReactNode } from 'react';
import styles from './SectionTitle.module.css';

interface SectionTitleProps {
  id?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function SectionTitle({ id, action, children }: SectionTitleProps) {
  return (
    <div className={styles.row}>
      <h2 id={id} className={styles.title}>{children}</h2>
      {action}
    </div>
  );
}
