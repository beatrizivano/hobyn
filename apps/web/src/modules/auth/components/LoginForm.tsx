import { useState, type FormEvent } from 'react';
import { authSchemas } from 'shared';
import { Button, TextField } from '../../../components/common';
import { Link } from 'react-router-dom';
import styles from './AuthForm.module.css';
export interface LoginValues { email: string; senha: string }
interface Props { error?: string; onSubmit: (values: LoginValues) => void | Promise<void> }
export function LoginForm({ error, onSubmit }: Props) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [errors, setErrors] = useState<{ email?: string; senha?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;
    const result = authSchemas.login.safeParse({ email, password: senha });
    if (!result.success) {
      const next: typeof errors = {};
      for (const issue of result.error.issues) next[issue.path[0] === 'password' ? 'senha' : 'email'] = issue.message;
      setErrors(next); return;
    }
    setErrors({}); setSubmitting(true);
    try { await onSubmit({ email: result.data.email, senha: result.data.password }); }
    finally { setSubmitting(false); }
  }
  return <form className={styles.form} onSubmit={submit} noValidate>
    {error && <p className={styles.formError} role="alert">{error}</p>}
    <TextField label="E-mail" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} error={errors.email} />
    <TextField label="Senha" type="password" autoComplete="current-password" value={senha} onChange={event => setSenha(event.target.value)} error={errors.senha} />
    <Link to="/esqueci-a-senha">Esqueci minha senha</Link>
    <Button type="submit" variant="primary" fullWidth disabled={submitting}>{submitting ? 'Entrando…' : 'Entrar'}</Button>
  </form>;
}
