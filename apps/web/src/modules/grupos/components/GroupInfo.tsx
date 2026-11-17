import { Tag } from '../../../components/common';
import type { Grupo } from '../../../types/domain';
import { formatShortDate } from '../../../utils/format';
import styles from './GroupInfo.module.css';

interface GroupInfoProps { grupo: Grupo; }

/** Regras principais do grupo. */
export function GroupInfo({ grupo }: GroupInfoProps) {
  const encerrado = grupo.endsAt !== null && new Date(grupo.endsAt) < new Date();
  return <div className={styles.info}>
    <div className={styles.tags}>
      <Tag>{grupo.modoPontuacao === 'tempo' ? 'Pontua por tempo' : 'Pontua por registro'}</Tag>
      {grupo.limiteRegistrosPorDia && <Tag>Até {grupo.limiteRegistrosPorDia} registros por dia</Tag>}
      {grupo.endsAt && <Tag>{encerrado ? 'Encerrado' : `Termina em ${formatShortDate(grupo.endsAt)}`}</Tag>}
    </div>
    {grupo.descricao && <p className={styles.description}>{grupo.descricao}</p>}
  </div>;
}
