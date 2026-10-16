import type { ReactNode } from 'react';
import { CircleAlert } from 'lucide-react';
import styles from './form.module.css';

export interface FieldMeta {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
}

export const hintId = (id: string) => `${id}-hint`;
export const errorId = (id: string) => `${id}-error`;

/** Valor de aria-describedby para ligar o campo à dica e à mensagem de erro. */
export function describedBy(id: string, { hint, error }: Pick<FieldMeta, 'hint' | 'error'>) {
  return [hint && hintId(id), error && errorId(id)].filter(Boolean).join(' ') || undefined;
}

/** Rótulo + dica + erro ao redor de qualquer controle. */
export function FormField({ id, label, hint, error, optional, children }: FieldMeta & { id: string; children: ReactNode }) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {optional && <span className={styles.optional}> (opcional)</span>}
      </label>
      {children}
      {hint && <p id={hintId(id)} className={styles.hint}>{hint}</p>}
      {error && (
        <p id={errorId(id)} className={styles.error} role="alert">
          <CircleAlert size={16} aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}
