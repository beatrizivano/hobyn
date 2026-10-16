import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import styles from './StateMessage.module.css';

type Kind = 'loading' | 'empty' | 'error';

interface StateMessageProps {
  kind: Kind;
  title?: string;
  children?: ReactNode;
  action?: ReactNode;
}

const DEFAULT_TITLE: Record<Kind, string> = {
  loading: 'Carregando…',
  empty: 'Nada por aqui ainda',
  error: 'Não foi possível carregar',
};

/** Estados de tela: carregando, vazio (convite à ação) e erro (diz o que fazer). */
export function StateMessage({ kind, title, children, action }: StateMessageProps) {
  return (
    <div className={cx(styles.message, styles[kind])} role={kind === 'error' ? 'alert' : 'status'}>
      <p className={styles.title}>{title ?? DEFAULT_TITLE[kind]}</p>
      {children && <p className={styles.body}>{children}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
