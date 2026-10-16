import { Avatar, Tag } from '../../../components/common';
import type { RankingEntry } from '../../../types/domain';
import { cx } from '../../../utils/cx';
import { formatPoints, fullName } from '../../../utils/format';
import styles from './RankingList.module.css';

interface RankingListProps {
  entries: RankingEntry[];
  currentUserId: string;
}

/** Ranking do grupo, do maior para o menor. Os 3 primeiros formam o pódio. */
export function RankingList({ entries, currentUserId }: RankingListProps) {
  return (
    <ol className={styles.list}>
      {entries.map((entry) => {
        const isMe = entry.usuario.id === currentUserId;
        return (
          <li key={entry.usuario.id} className={cx(styles.row, isMe && styles.me)}>
            <span className={cx(styles.position, entry.colocacao <= 3 && styles.podium)}>
              <span className="sr-only">Posição </span>
              {entry.colocacao}
            </span>
            <Avatar name={fullName(entry.usuario)} src={entry.usuario.fotoDePerfil} />
            <span className={styles.name}>
              {fullName(entry.usuario)}
              {isMe && <Tag>Você</Tag>}
            </span>
            <span className={styles.points}>{formatPoints(entry.pontuacao)}</span>
          </li>
        );
      })}
    </ol>
  );
}
