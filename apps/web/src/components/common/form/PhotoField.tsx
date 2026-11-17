import { useEffect, useId, useRef, useState, type ChangeEvent } from 'react';
import { PHOTO_MAX_BYTES, PHOTO_MIME_TYPES } from 'shared';
import { Camera } from 'lucide-react';
import { Button } from '../Button';
import { PhotoFrame } from '../PhotoFrame';
import { describedBy, FormField, type FieldMeta } from './FormField';
import styles from './form.module.css';

interface PhotoFieldProps extends FieldMeta {
  value: File | null;
  existingSrc?: string | null;
  onError?: (message?: string) => void;
  onChange: (file: File | null) => void;
  /** Limite por arquivo (RNF8: fotos até 10 MB). */
  maxSizeMB?: number;
  ratio?: string;
}

/** Seleção de foto com pré-visualização e validação de tamanho antes de enviar. */
export function PhotoField({ label, hint, error, optional, value, onChange, maxSizeMB = PHOTO_MAX_BYTES / (1024 * 1024), existingSrc, onError, ratio = '4 / 3' }: PhotoFieldProps) {
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
    const invalid = file && !PHOTO_MIME_TYPES.includes(file.type) ? 'Envie uma foto JPEG, PNG ou WebP.' : file && file.size > maxSizeMB * 1024 * 1024 ? `A foto precisa ter até ${maxSizeMB} MB.` : undefined;
    setSizeError(invalid);
    onError?.(invalid);
    onChange(invalid ? null : file);
  }

  const shownError = sizeError ?? error;

  return (
    <FormField id={id} label={label} hint={hint} error={shownError} optional={optional}>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={PHOTO_MIME_TYPES.join(',')}
        className="sr-only"
        tabIndex={-1}
        aria-describedby={describedBy(id, { hint, error: shownError })}
        onChange={handleChange}
      />
      <PhotoFrame src={preview ?? existingSrc} alt="Pré-visualização da foto escolhida" ratio={ratio} />
      <div className={styles.photoActions}>
        <Button icon={<Camera size={18} aria-hidden="true" />} onClick={() => inputRef.current?.click()}>
          {value ? 'Trocar foto' : 'Escolher foto'}
        </Button>
        {(value || sizeError) && optional && (
          <Button variant="ghost" onClick={() => { setSizeError(undefined); onError?.(undefined); onChange(null); }}>
            {existingSrc ? 'Manter foto atual' : 'Remover seleção'}
          </Button>
        )}
      </div>
    </FormField>
  );
}
