import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar, Card, PhotoFrame, Tag } from '../../../components/common';
import type { Registro } from '../../../types/domain';
import { formatDuration, formatRelativeTime, fullName, joinNames } from '../../../utils/format';
import { hobbyTone } from '../../../utils/hobbyTone';
import styles from './RecordCard.module.css';

interface RecordCardProps {
  registro: Registro;
}

/** Item do feed do grupo; o card inteiro leva ao registro completo. */
export function RecordCard({ registro }: RecordCardProps) {
  const [primeiro] = registro.autores;
  return (
    <Card as="article" className={styles.card}>
      <Link to={`/registros/${registro.id}`} className={styles.link}>
        <div className={styles.header}>
          <Avatar name={fullName(primeiro)} src={primeiro.fotoDePerfil} size="sm" />
          <span className={styles.author}>{joinNames(registro.autores.map((autor) => autor.nome))}</span>
          <Tag tone={hobbyTone(registro.hobby.nome)}>{registro.hobby.nome}</Tag>
        </div>
        <PhotoFrame src={registro.foto} ratio="16 / 7" />
        <div className={styles.footer}>
          <span>{formatDuration(registro.duracaoMinutos)} · {formatRelativeTime(registro.createdAt)}</span>
          <span className={styles.likes}>
            <Heart size={14} aria-hidden="true" />
            {registro.curtidas}
            <span className="sr-only"> curtidas</span>
          </span>
        </div>
      </Link>
    </Card>
  );
}
