import { useState, type FormEvent } from 'react';
import { CircleAlert } from 'lucide-react';
import { Button, TextField } from '../../../components/common';
import styles from './AuthForm.module.css';

export interface LoginValues {
  email: string;
  senha: string;
}

interface LoginFormProps {
  /** Erro vindo do servidor. Sempre genérico: não diz se o e-mail ou a senha está errado. */
  error?: string;
  onSubmit: (values: LoginValues) => void | Promise<void>;
}

// TODO: trocar as validações abaixo pelo schema de login de `packages/shared` (ARQUITETURA.md, regra 1).
export function LoginForm({ error, onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [errors, setErrors] = useState<{ email?: string; senha?: string }>({});

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const next = {
      email: /^\S+@\S+\.\S+$/.test(email) ? undefined : 'Informe um e-mail válido.',
      senha: senha ? undefined : 'Informe sua senha.',
    };
    setErrors(next);
    if (next.email || next.senha) return;
    await onSubmit({ email: email.trim(), senha });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {error && (
        <p className={styles.formError} role="alert">
          <CircleAlert size={16} aria-hidden="true" />
          {error}
        </p>
      )}
      <TextField label="E-mail" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
      <TextField label="Senha" type="password" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} error={errors.senha} />
      <Button type="submit" variant="primary" fullWidth>Entrar</Button>
    </form>
  );
}
