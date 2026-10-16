import { Link } from 'react-router-dom';
import { PhotoFrame } from '../../../components/common';
import type { Grupo } from '../../../types/domain';
import { MemberStack } from './MemberStack';
import styles from './GroupCard.module.css';

interface GroupCardProps {
  grupo: Grupo;
}

export function GroupCard({ grupo }: GroupCardProps) {
  return (
    <Link to={`/grupos/${grupo.id}`} className={styles.link}>
      <PhotoFrame src={grupo.foto} ratio="4 / 3" className={styles.photo}>
        <MemberStack membros={grupo.membros} />
      </PhotoFrame>
      <span className={styles.name}>{grupo.nome}</span>
      <span className={styles.meta}>{grupo.membros.length} membros</span>
    </Link>
  );
}
