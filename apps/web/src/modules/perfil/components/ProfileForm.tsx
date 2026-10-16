import { useState, type FormEvent } from 'react';
import { Button, ButtonLink, PhotoField, TextField } from '../../../components/common';
import type { Usuario } from '../../../types/domain';
import styles from './ProfileForm.module.css';

export interface ProfileFormValues {
  nome: string;
  sobrenome: string;
  foto: File | null;
}

interface ProfileFormProps {
  user: Usuario;
  onSubmit: (values: ProfileFormValues) => void | Promise<void>;
}

export function ProfileForm({ user, onSubmit }: ProfileFormProps) {
  const [nome, setNome] = useState(user.nome);
  const [sobrenome, setSobrenome] = useState(user.sobrenome);
  const [foto, setFoto] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ nome?: string; sobrenome?: string }>({});

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const next = {
      nome: nome.trim() ? undefined : 'Informe seu nome.',
      sobrenome: sobrenome.trim() ? undefined : 'Informe seu sobrenome.',
    };
    setErrors(next);
    if (next.nome || next.sobrenome) return;
    await onSubmit({ nome: nome.trim(), sobrenome: sobrenome.trim(), foto });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <TextField label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} error={errors.nome} autoComplete="given-name" />
      <TextField label="Sobrenome" value={sobrenome} onChange={(e) => setSobrenome(e.target.value)} error={errors.sobrenome} autoComplete="family-name" />
      <PhotoField label="Foto de perfil" optional value={foto} onChange={setFoto} ratio="1 / 1" />
      <div className={styles.actions}>
        <Button type="submit" variant="primary" fullWidth>Salvar alterações</Button>
        <ButtonLink to="/perfil" fullWidth>Cancelar</ButtonLink>
      </div>
    </form>
  );
}
