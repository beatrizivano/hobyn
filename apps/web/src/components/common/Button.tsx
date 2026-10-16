import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cx } from '../../utils/cx';
import styles from './Button.module.css';

type Variant = 'primary' | 'secondary' | 'ghost';

interface BaseProps {
  variant?: Variant;
  fullWidth?: boolean;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}

const classes = ({ variant = 'secondary', fullWidth, className }: Pick<BaseProps, 'variant' | 'fullWidth' | 'className'>) =>
  cx(styles.button, styles[variant], fullWidth && styles.fullWidth, className);

export function Button({
  variant,
  fullWidth,
  icon,
  className,
  children,
  type = 'button',
  ...rest
}: BaseProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>) {
  return (
    <button type={type} className={classes({ variant, fullWidth, className })} {...rest}>
      {icon}
      {children}
    </button>
  );
}

export function ButtonLink({ to, variant, fullWidth, icon, className, children }: BaseProps & { to: string }) {
  return (
    <Link to={to} className={classes({ variant, fullWidth, className })}>
      {icon}
      {children}
    </Link>
  );
}
