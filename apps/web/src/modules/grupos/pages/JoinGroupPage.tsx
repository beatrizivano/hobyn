import { useState, type FormEvent } from 'react';
import { inviteSchemas } from 'shared';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, ScreenHeader, TextField } from '../../../components/common';
import { useJoinInvite } from '../../../hooks/useInvites';
import styles from './JoinGroupPage.module.css';

export function JoinGroupPage() {
  const [params] = useSearchParams();
  const [codigo, setCodigo] = useState(params.get('codigo') ?? '');
  const [validation, setValidation] = useState<string>();
  const join = useJoinInvite();
  const navigate = useNavigate();
  async function submit(event: FormEvent) {
    event.preventDefault();
    const parsed = inviteSchemas.join.safeParse({ codigo });
    if (!parsed.success) { setValidation(parsed.error.issues[0]?.message); return; }
    setValidation(undefined);
    try {
      const result = await join.mutateAsync(parsed.data.codigo);
      navigate(`/grupos/${result.groupId}`, { replace: true, state: { inviteMessage: result.alreadyMember ? 'Você já fazia parte deste grupo.' : 'Você entrou no grupo.' } });
    } catch { /* O erro da mutação permanece visível no formulário. */ }
  }
  return <div className={styles.page}>
    <ScreenHeader title="Entrar em um grupo" backTo="/" />
    <form className={styles.form} onSubmit={submit} noValidate>
      <TextField label="Código do convite" value={codigo} onChange={event => setCodigo(event.target.value)} placeholder="ABCD-EFGH-JKLM-NPQR" autoComplete="off" autoCapitalize="characters" error={validation} />
      {join.error && <p role="alert">{join.error.message}</p>}
      <Button type="submit" variant="primary" fullWidth disabled={join.isPending}>{join.isPending ? 'Entrando…' : 'Entrar no grupo'}</Button>
    </form>
  </div>;
}
