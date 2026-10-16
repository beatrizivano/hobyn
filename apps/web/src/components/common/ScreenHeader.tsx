import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { IconLink } from './IconButton';
import styles from './ScreenHeader.module.css';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  /** Rota do botão voltar; sem ela, o botão não aparece. */
  backTo?: string;
  trailing?: ReactNode;
}

export function ScreenHeader({ title, subtitle, backTo, trailing }: ScreenHeaderProps) {
  return (
    <header className={styles.header}>
      {backTo && <IconLink to={backTo} label="Voltar" icon={<ArrowLeft size={20} aria-hidden="true" />} />}
      <div className={styles.titles}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {trailing}
    </header>
  );
}
