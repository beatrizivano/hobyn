import { Check } from 'lucide-react';
import styles from './form.module.css';

interface ChipOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface ChipGroupProps {
  legend: string;
  options: ChipOption[];
  values: string[];
  onChange: (values: string[]) => void;
  hint?: string;
  optional?: boolean;
}

/** Escolha múltipla apresentada como chips (checkbox). */
export function ChipGroup({ legend, options, values, onChange, hint, optional }: ChipGroupProps) {
  const toggle = (value: string) =>
    onChange(values.includes(value) ? values.filter((v) => v !== value) : [...values, value]);

  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.label}>
        {legend}
        {optional && <span className={styles.optional}> (opcional)</span>}
      </legend>
      <div className={styles.chips}>
        {options.map((option) => (
          <label key={option.value} className={styles.chip}>
            <input
              className="sr-only"
              type="checkbox"
              checked={values.includes(option.value)}
              disabled={option.disabled}
              onChange={() => toggle(option.value)}
            />
            <Check className={styles.check} size={14} aria-hidden="true" />
            {option.label}
          </label>
        ))}
      </div>
      {hint && <p className={styles.hint}>{hint}</p>}
    </fieldset>
  );
}
