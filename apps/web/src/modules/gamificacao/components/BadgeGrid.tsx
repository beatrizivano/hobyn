import { useState } from 'react';
import { Card } from '../../../components/common';
import type { Conquista } from '../../../types/domain';
import { formatLongDate } from '../../../utils/format';
import { BadgeTile } from './BadgeTile';
import styles from './BadgeGrid.module.css';

interface BadgeGridProps {
  badges: Conquista[];
}

/** Grade de conquistas; tocar em uma mostra como ela é conquistada. */
export function BadgeGrid({ badges }: BadgeGridProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = badges.find((badge) => badge.id === selectedId);

  return (
    <div className={styles.wrapper}>
      <ul className={styles.grid}>
        {badges.map((badge) => (
          <li key={badge.id}>
            <BadgeTile
              nome={badge.nome}
              earned={badge.conquistadoEm !== null}
              selected={badge.id === selectedId}
              onSelect={() => setSelectedId(badge.id === selectedId ? null : badge.id)}
            />
          </li>
        ))}
      </ul>
      <div aria-live="polite">
        {selected ? (
          <Card tone="white" className={styles.detail}>
            <h3 className={styles.detailTitle}>{selected.nome}</h3>
            <p>{selected.descricao}</p>
            <p className={styles.status}>
              {selected.conquistadoEm ? `Conquistada em ${formatLongDate(selected.conquistadoEm)}` : 'Ainda não conquistada'}
            </p>
          </Card>
        ) : (
          <p className={styles.hint}>Toque em uma conquista para ver como conquistá-la.</p>
        )}
      </div>
    </div>
  );
}
