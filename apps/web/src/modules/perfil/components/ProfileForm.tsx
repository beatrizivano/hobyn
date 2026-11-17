import { useState, type FormEvent } from 'react';
import { userSchemas } from 'shared';
import { Button, ButtonLink, PhotoField, TextField } from '../../../components/common';
import type { Usuario } from '../../../types/domain';
import styles from './ProfileForm.module.css';
export interface ProfileFormValues { nome: string; sobrenome: string; foto: File | null }
interface Props { user: Usuario; error?: string; onSubmit: (values: ProfileFormValues) => void | Promise<void> }
export function ProfileForm({ user, error, onSubmit }: Props) {
  const [nome, setNome] = useState(user.nome);
  const [sobrenome, setSobrenome] = useState(user.sobrenome);
  const [foto, setFoto] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string>();
  const [validation, setValidation] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;
    if (photoError) { setValidation(photoError); return; }
    const result = userSchemas.updateFields.safeParse({ nome, sobrenome });
    if (!result.success) { setValidation(result.error.issues[0].message); return; }
    setValidation(undefined); setSubmitting(true);
    try { await onSubmit({ nome: result.data.nome!, sobrenome: result.data.sobrenome!, foto }); }
    finally { setSubmitting(false); }
  }
  return <form className={styles.form} onSubmit={submit} noValidate>
    {(error || validation) && <p role="alert">{error || validation}</p>}
    <TextField label="Nome" value={nome} onChange={event => setNome(event.target.value)} autoComplete="given-name" />
    <TextField label="Sobrenome" value={sobrenome} onChange={event => setSobrenome(event.target.value)} autoComplete="family-name" />
    <PhotoField label="Foto de perfil" optional value={foto} existingSrc={user.fotoDePerfil} onChange={setFoto} onError={setPhotoError} ratio="1 / 1" />
    <div className={styles.actions}><Button type="submit" variant="primary" fullWidth disabled={submitting}>{submitting ? 'Salvando…' : 'Salvar alterações'}</Button><ButtonLink to="/perfil" fullWidth>Cancelar</ButtonLink></div>
  </form>;
}
