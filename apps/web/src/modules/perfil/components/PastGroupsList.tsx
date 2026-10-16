import { Card } from '../../../components/common';
import type { GrupoAnterior } from '../../../types/domain';
import { formatShortDate, ordinal } from '../../../utils/format';
import styles from './PastGroupsList.module.css';

interface PastGroupsListProps {
  grupos: GrupoAnterior[];
}

/** Colocação final em grupos com prazo que já se encerraram. */
export function PastGroupsList({ grupos }: PastGroupsListProps) {
  if (grupos.length === 0) {
    return <p className={styles.empty}>Quando um grupo com prazo terminar, sua colocação final fica registrada aqui.</p>;
  }
  return (
    <ul className={styles.list}>
      {grupos.map((grupo) => (
        <Card as="li" key={grupo.grupoId} className={styles.item}>
          <div>
            <p className={styles.name}>{grupo.nome}</p>
            <p className={styles.date}>Encerrado em {formatShortDate(grupo.encerradoEm)}</p>
          </div>
          <p className={styles.place}>
            {ordinal(grupo.colocacao)} <span className={styles.total}>de {grupo.totalMembros}</span>
          </p>
        </Card>
      ))}
    </ul>
  );
}
