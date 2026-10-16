import { forwardRef, useId, type SelectHTMLAttributes } from 'react';
import { cx } from '../../../utils/cx';
import { describedBy, FormField, type FieldMeta } from './FormField';
import styles from './form.module.css';

export interface SelectOption {
  value: string;
  label: string;
}

type SelectFieldProps = FieldMeta &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className' | 'children'> & {
    options: SelectOption[];
    /** Opção inicial sem valor (ex.: "Escolha um hobby"). */
    placeholder?: string;
  };

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { label, hint, error, optional, id, options, placeholder, ...rest },
  ref,
) {
  const autoId = useId();
  const selectId = id ?? autoId;
  return (
    <FormField id={selectId} label={label} hint={hint} error={error} optional={optional}>
      <select
        ref={ref}
        id={selectId}
        className={cx(styles.control, error && styles.invalid)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(selectId, { hint, error })}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </FormField>
  );
});
