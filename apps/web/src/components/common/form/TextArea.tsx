import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';
import { cx } from '../../../utils/cx';
import { describedBy, FormField, type FieldMeta } from './FormField';
import styles from './form.module.css';

type TextAreaProps = FieldMeta & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'>;

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { label, hint, error, optional, id, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <FormField id={inputId} label={label} hint={hint} error={error} optional={optional}>
      <textarea
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
