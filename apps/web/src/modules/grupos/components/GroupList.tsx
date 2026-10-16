import type { Grupo } from '../../../types/domain';
import { GroupCard } from './GroupCard';
import styles from './GroupList.module.css';

interface GroupListProps {
  grupos: Grupo[];
}

/** Carrossel horizontal dos grupos do usuário. */
export function GroupList({ grupos }: GroupListProps) {
  return (
    <ul className={styles.list}>
      {grupos.map((grupo) => (
        <li key={grupo.id} className={styles.item}>
          <GroupCard grupo={grupo} />
        </li>
      ))}
    </ul>
  );
}
