import { useRef, useState } from 'react';
import { Copy, Link as LinkIcon, RefreshCw } from 'lucide-react';
import { Button, Card, StateMessage, TextField } from '../../../components/common';
import { useGenerateInvite, useGroupInvite } from '../../../hooks/useInvites';
import { formatLongDate } from '../../../utils/format';
import styles from './GroupInvitePanel.module.css';

const formatted = (code: string) => code.match(/.{1,4}/g)?.join('-') ?? code;

export function GroupInvitePanel({ groupId }: { groupId: string }) {
  const invite = useGroupInvite(groupId, true);
  const generate = useGenerateInvite(groupId);
  const input = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState('');
  async function copy(value: string, message: string) {
    try { await navigator.clipboard.writeText(value); setFeedback(message); }
    catch { input.current?.select(); setFeedback('Selecione e copie o código manualmente.'); }
  }
  function generateInvite() {
    if (generate.isPending) return;
    if (invite.data && !window.confirm('Gerar um novo código? O convite atual deixará de funcionar imediatamente.')) return;
    setFeedback('');
    generate.mutate();
  }
  if (invite.isLoading) return <StateMessage kind="loading" title="Carregando convite…" />;
  if (invite.error) return <StateMessage kind="error" action={<Button onClick={() => { void invite.refetch(); }}>Tentar novamente</Button>}>{invite.error.message}</StateMessage>;
  const current = invite.data;
  const link = current ? `${window.location.origin}/grupos/entrar?codigo=${encodeURIComponent(current.codigo)}` : '';
  return <Card as="section" className={styles.panel}>
    <h2>Convidar pessoas</h2>
    <p>{current ? `Este código é válido até ${formatLongDate(current.expiresAt)}.` : 'Gere um código para permitir a entrada de novos membros.'}</p>
    {current && <TextField ref={input} label="Código do convite" value={formatted(current.codigo)} readOnly />}
    {generate.error && <p role="alert">{generate.error.message}</p>}
    <div className={styles.actions}>
      <Button variant="primary" icon={<RefreshCw size={18} aria-hidden="true" />} disabled={generate.isPending} onClick={generateInvite}>{generate.isPending ? 'Gerando…' : current ? 'Gerar novo código' : 'Gerar convite'}</Button>
      {current && <><Button icon={<Copy size={18} aria-hidden="true" />} onClick={() => void copy(formatted(current.codigo), 'Código copiado.')}>Copiar código</Button><Button icon={<LinkIcon size={18} aria-hidden="true" />} onClick={() => void copy(link, 'Link copiado.')}>Copiar link</Button></>}
    </div>
    {current && <small>Gerar um novo código invalida o anterior.</small>}
    <p role="status">{feedback}</p>
  </Card>;
}
