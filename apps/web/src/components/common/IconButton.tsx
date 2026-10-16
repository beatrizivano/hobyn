import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { cx } from '../../utils/cx';
import styles from './IconButton.module.css';

interface BaseProps {
  /** Nome acessível: o botão só tem ícone. */
  label: string;
  icon: ReactNode;
  variant?: 'light' | 'dark';
  size?: 'md' | 'lg';
  className?: string;
}

const classes = ({ variant = 'light', size = 'md', className }: Pick<BaseProps, 'variant' | 'size' | 'className'>) =>
  cx(styles.icon, styles[variant], size === 'lg' && styles.lg, className);

export function IconButton({
  label,
  icon,
  variant,
  size,
  className,
  type = 'button',
  ...rest
}: BaseProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children' | 'aria-label'>) {
  return (
    <button type={type} aria-label={label} className={classes({ variant, size, className })} {...rest}>
      {icon}
    </button>
  );
}

/** Link com aparência de IconButton; recebe aria-current="page" na rota ativa. */
export function IconLink({ to, label, icon, variant, size, className }: BaseProps & { to: string }) {
  return (
    <NavLink to={to} end aria-label={label} className={classes({ variant, size, className })}>
      {icon}
    </NavLink>
  );
}
