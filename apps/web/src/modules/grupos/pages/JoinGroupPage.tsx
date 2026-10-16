import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, ScreenHeader, TextField } from '../../../components/common';
import styles from './JoinGroupPage.module.css';

/** Entrar em um grupo por código de convite (RF4). */
export function JoinGroupPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [code, setCode] = useState(params.get('codigo') ?? '');
  const [error, setError] = useState<string>();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!code.trim()) {
      setError('Digite o código que você recebeu.');
      return;
    }
    setError(undefined);
    // TODO: grupos.service.join(code); código inválido ou expirado deve explicar o motivo.
    navigate('/');
  }

  return (
    <div className={styles.page}>
      <ScreenHeader title="Entrar em um grupo" backTo="/" />
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <TextField
          label="Código do convite"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          error={error}
          hint="Peça o código para quem administra o grupo."
          autoComplete="off"
          autoCapitalize="characters"
        />
        <Button type="submit" variant="primary" fullWidth>Entrar no grupo</Button>
      </form>
    </div>
  );
}
