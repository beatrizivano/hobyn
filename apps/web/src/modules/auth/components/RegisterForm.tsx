import { useState, type FormEvent } from 'react';
import { Button, TextField } from '../../../components/common';
import styles from './AuthForm.module.css';

export interface RegisterValues {
  nome: string;
  sobrenome: string;
  email: string;
  senha: string;
}

interface RegisterFormProps {
  onSubmit: (values: RegisterValues) => void | Promise<void>;
}

// TODO: trocar as validações abaixo pelo schema de cadastro de `packages/shared` (ARQUITETURA.md, regra 1).
export function RegisterForm({ onSubmit }: RegisterFormProps) {
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterValues, string>>>({});

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const next: typeof errors = {
      nome: nome.trim() ? undefined : 'Informe seu nome.',
      sobrenome: sobrenome.trim() ? undefined : 'Informe seu sobrenome.',
      email: /^\S+@\S+\.\S+$/.test(email) ? undefined : 'Informe um e-mail válido.',
      senha: senha.length >= 8 ? undefined : 'A senha precisa ter pelo menos 8 caracteres.',
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    await onSubmit({ nome: nome.trim(), sobrenome: sobrenome.trim(), email: email.trim(), senha });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <TextField label="Nome" autoComplete="given-name" value={nome} onChange={(e) => setNome(e.target.value)} error={errors.nome} />
      <TextField label="Sobrenome" autoComplete="family-name" value={sobrenome} onChange={(e) => setSobrenome(e.target.value)} error={errors.sobrenome} />
      <TextField label="E-mail" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
      <TextField
        label="Senha"
        type="password"
        autoComplete="new-password"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        error={errors.senha}
        hint="Pelo menos 8 caracteres."
      />
      <Button type="submit" variant="primary" fullWidth>Criar conta</Button>
    </form>
  );
}
