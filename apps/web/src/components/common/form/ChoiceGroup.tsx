import { Check } from 'lucide-react';
import styles from './form.module.css';

interface Option<T extends string> {
  value: T;
  label: string;
  description?: string;
}

interface ChoiceGroupProps<T extends string> {
  legend: string;
  name: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  hint?: string;
}

/** Escolha única apresentada como cartões (radio). */
export function ChoiceGroup<T extends string>({ legend, name, options, value, onChange, hint }: ChoiceGroupProps<T>) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.label}>{legend}</legend>
      {options.map((option) => (
        <label key={option.value} className={styles.choice}>
          <input
            className="sr-only"
            type="radio"
            name={name}
            value={option.value}
            checked={option.value === value}
            onChange={() => onChange(option.value)}
          />
          <span className={styles.choiceTitle}>
            <Check className={styles.check} size={16} aria-hidden="true" />
            {option.label}
          </span>
          {option.description && <span className={styles.choiceDescription}>{option.description}</span>}
        </label>
      ))}
      {hint && <p className={styles.hint}>{hint}</p>}
    </fieldset>
  );
}
