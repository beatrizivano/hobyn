import { useEffect, useId, useRef, useState, type ChangeEvent } from 'react';
import { Camera } from 'lucide-react';
import { Button } from '../Button';
import { PhotoFrame } from '../PhotoFrame';
import { describedBy, FormField, type FieldMeta } from './FormField';
import styles from './form.module.css';

interface PhotoFieldProps extends FieldMeta {
  value: File | null;
  onChange: (file: File | null) => void;
  /** Limite por arquivo (RNF8: fotos até 10 MB). */
  maxSizeMB?: number;
  ratio?: string;
}

/** Seleção de foto com pré-visualização e validação de tamanho antes de enviar. */
export function PhotoField({ label, hint, error, optional, value, onChange, maxSizeMB = 10, ratio = '4 / 3' }: PhotoFieldProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState<string>();

  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    event.target.value = '';
    if (file && file.size > maxSizeMB * 1024 * 1024) {
      setSizeError(`A foto precisa ter até ${maxSizeMB} MB.`);
      return;
    }
    setSizeError(undefined);
    onChange(file);
  }

  const shownError = sizeError ?? error;

  return (
    <FormField id={id} label={label} hint={hint} error={shownError} optional={optional}>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        aria-describedby={describedBy(id, { hint, error: shownError })}
        onChange={handleChange}
      />
      <PhotoFrame src={preview} alt="Pré-visualização da foto escolhida" ratio={ratio} />
      <div className={styles.photoActions}>
        <Button icon={<Camera size={18} aria-hidden="true" />} onClick={() => inputRef.current?.click()}>
          {value ? 'Trocar foto' : 'Escolher foto'}
        </Button>
        {value && optional && (
          <Button variant="ghost" onClick={() => onChange(null)}>
            Remover
          </Button>
        )}
      </div>
    </FormField>
  );
}
