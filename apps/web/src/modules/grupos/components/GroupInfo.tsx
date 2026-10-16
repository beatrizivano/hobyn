import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { Button, Tag } from '../../../components/common';
import type { Grupo } from '../../../types/domain';
import { formatShortDate } from '../../../utils/format';
import styles from './GroupInfo.module.css';

interface GroupInfoProps {
  grupo: Grupo;
}

/** Regras do grupo em tags + compartilhamento do convite (some quando o grupo encerra). */
export function GroupInfo({ grupo }: GroupInfoProps) {
  const [feedback, setFeedback] = useState('');
  const encerrado = grupo.endsAt !== null && new Date(grupo.endsAt) < new Date();

  async function shareInvite() {
    const url = `${window.location.origin}/grupos/entrar?codigo=${encodeURIComponent(grupo.codigoConvite)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `Entre no grupo ${grupo.nome}`, url });
      } else {
        await navigator.clipboard.writeText(url);
        setFeedback('Convite copiado.');
      }
    } catch {
      /* Compartilhamento cancelado pelo usuário: nada a fazer. */
    }
  }

  return (
    <div className={styles.info}>
      <div className={styles.tags}>
        <Tag>{grupo.modoPontuacao === 'tempo' ? 'Pontua por tempo' : 'Pontua por registro'}</Tag>
        {grupo.limiteRegistrosPorDia && <Tag>Até {grupo.limiteRegistrosPorDia} registros por dia</Tag>}
        {grupo.endsAt && <Tag>{encerrado ? 'Encerrado' : `Termina em ${formatShortDate(grupo.endsAt)}`}</Tag>}
      </div>
      {grupo.descricao && <p className={styles.description}>{grupo.descricao}</p>}
      {!encerrado && (
        <Button icon={<Share2 size={18} aria-hidden="true" />} onClick={shareInvite}>
          Compartilhar convite
        </Button>
      )}
      <p className="sr-only" role="status">{feedback}</p>
    </div>
  );
}
