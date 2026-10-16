import { useState } from 'react';
import { Heart, Share2 } from 'lucide-react';
import { Button } from '../../../components/common';
import styles from './RecordActions.module.css';

interface RecordActionsProps {
  recordId: string;
  curtidas: number;
}

/** Curtir e compartilhar. Reações ainda não existem no modelo de dados (ver DESIGN_SYSTEM.md). */
export function RecordActions({ recordId, curtidas }: RecordActionsProps) {
  const [liked, setLiked] = useState(false);
  const [feedback, setFeedback] = useState('');

  async function share() {
    const url = `${window.location.origin}/registros/${recordId}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Registro no Hobyn', url });
      } else {
        await navigator.clipboard.writeText(url);
        setFeedback('Link copiado.');
      }
    } catch {
      /* Compartilhamento cancelado pelo usuário: nada a fazer. */
    }
  }

  return (
    <div className={styles.actions}>
      <Button
        aria-pressed={liked}
        icon={<Heart size={18} aria-hidden="true" fill={liked ? 'currentColor' : 'none'} />}
        onClick={() => setLiked((value) => !value)}
      >
        {curtidas + (liked ? 1 : 0)}
        <span className="sr-only"> curtidas</span>
      </Button>
      <Button fullWidth icon={<Share2 size={18} aria-hidden="true" />} onClick={share}>
        Compartilhar
      </Button>
      <p className="sr-only" role="status">{feedback}</p>
    </div>
  );
}
