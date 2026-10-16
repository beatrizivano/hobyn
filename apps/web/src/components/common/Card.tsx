import { createElement, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import styles from './Card.module.css';

export type CardTone = 'surface' | 'white' | 'dotted' | 'dark';

interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'className'> {
  as?: 'div' | 'section' | 'article' | 'aside' | 'li';
  tone?: CardTone;
  padded?: boolean;
  className?: string;
  children: ReactNode;
}

export function Card({ as = 'div', tone = 'surface', padded = true, className, children, ...rest }: CardProps) {
  return createElement(as, { className: cx(styles.card, styles[tone], padded && styles.padded, className), ...rest }, children);
}
