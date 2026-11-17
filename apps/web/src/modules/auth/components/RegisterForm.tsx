import { useState, type FormEvent } from 'react';
import { authSchemas } from 'shared';
import { Button, TextField } from '../../../components/common';
import styles from './AuthForm.module.css';
export interface RegisterValues { nome: string; sobrenome: string; email: string; senha: string }
interface Props { error?: string; onSubmit: (values: RegisterValues) => void | Promise<void> }
export function RegisterForm({ error, onSubmit }: Props) {
  const [values, setValues] = useState<RegisterValues>({ nome: '', sobrenome: '', email: '', senha: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterValues, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const update = (field: keyof RegisterValues, value: string) => setValues(current => ({ ...current, [field]: value }));
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;
    const { senha, ...profile } = values;
    const result = authSchemas.register.safeParse({ ...profile, password: senha });
    if (!result.success) {
      const next: typeof errors = {};
      for (const issue of result.error.issues) next[(issue.path[0] === 'password' ? 'senha' : issue.path[0]) as keyof RegisterValues] = issue.message;
      setErrors(next); return;
    }
    setErrors({}); setSubmitting(true);
    const { password, ...data } = result.data;
    try { await onSubmit({ ...data, senha: password }); }
    finally { setSubmitting(false); }
  }
  return <form className={styles.form} onSubmit={submit} noValidate>
    {error && <p className={styles.formError} role="alert">{error}</p>}
    <TextField label="Nome" autoComplete="given-name" value={values.nome} onChange={event => update('nome', event.target.value)} error={errors.nome} />
    <TextField label="Sobrenome" autoComplete="family-name" value={values.sobrenome} onChange={event => update('sobrenome', event.target.value)} error={errors.sobrenome} />
    <TextField label="E-mail" type="email" autoComplete="email" value={values.email} onChange={event => update('email', event.target.value)} error={errors.email} />
    <TextField label="Senha" type="password" autoComplete="new-password" value={values.senha} onChange={event => update('senha', event.target.value)} error={errors.senha} hint="Pelo menos 8 caracteres." />
    <Button type="submit" variant="primary" fullWidth disabled={submitting}>{submitting ? 'Criando…' : 'Criar conta'}</Button>
  </form>;
}
