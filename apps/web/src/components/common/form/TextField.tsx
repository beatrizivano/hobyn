import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { cx } from '../../../utils/cx';
import { describedBy, FormField, type FieldMeta } from './FormField';
import styles from './form.module.css';

type TextFieldProps = FieldMeta & Omit<InputHTMLAttributes<HTMLInputElement>, 'className'>;

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, hint, error, optional, id, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <FormField id={inputId} label={label} hint={hint} error={error} optional={optional}>
      <input
        ref={ref}
        id={inputId}
        className={cx(styles.control, error && styles.invalid)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(inputId, { hint, error })}
        {...rest}
      />
    </FormField>
  );
});
