import { Eye, EyeOff } from 'lucide-react';
import { forwardRef, useId, useState, type InputHTMLAttributes } from 'react';
import { cx } from '../../../utils/cx';
import { describedBy, FormField, type FieldMeta } from './FormField';
import styles from './form.module.css';

type TextFieldProps = FieldMeta & Omit<InputHTMLAttributes<HTMLInputElement>, 'className'>;

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, hint, error, optional, id, type, disabled, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const isPassword = type === 'password';
  const [passwordVisible, setPasswordVisible] = useState(false);
  const inputType = isPassword && passwordVisible ? 'text' : type;

  return (
    <FormField id={inputId} label={label} hint={hint} error={error} optional={optional}>
      <div className={styles.controlShell}>
        <input
          ref={ref}
          id={inputId}
          type={inputType}
          disabled={disabled}
          className={cx(styles.control, isPassword && styles.passwordControl, error && styles.invalid)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(inputId, { hint, error })}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            className={styles.visibilityButton}
            aria-label={passwordVisible ? 'Esconder senha' : 'Mostrar senha'}
            aria-pressed={passwordVisible}
            disabled={disabled}
            onClick={() => setPasswordVisible(visible => !visible)}
          >
            {passwordVisible
              ? <EyeOff size={20} aria-hidden="true" />
              : <Eye size={20} aria-hidden="true" />}
          </button>
        )}
      </div>
    </FormField>
  );
});
