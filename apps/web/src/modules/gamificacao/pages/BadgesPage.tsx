import { ScreenHeader, SectionTitle, StateMessage } from '../../../components/common';
import { useBadges, useUserStats } from '../../../hooks/useGamificacao';
import { BadgeGrid } from '../components/BadgeGrid';
import { PointsCard } from '../components/PointsCard';
import styles from './BadgesPage.module.css';

/** Conquistas: pontos, desafios concluídos e badges. */
export function BadgesPage() {
  const badges = useBadges();
  const stats = useUserStats();

  if (badges.isLoading || stats.isLoading) return <StateMessage kind="loading" />;
  if (badges.error || stats.error || !badges.data || !stats.data) {
    return <StateMessage kind="error">Tente abrir a tela de novo em instantes.</StateMessage>;
  }

  const earned = badges.data.filter((badge) => badge.conquistadoEm !== null).length;

  return (
    <div className={styles.page}>
      <ScreenHeader title="Conquistas" backTo="/" />
      <PointsCard total={stats.data.pontosTotais} desafiosConcluidos={stats.data.desafiosConcluidos} />
      <section aria-labelledby="badges-title">
        <SectionTitle
          id="badges-title"
          action={<p className={styles.count}>{earned} de {badges.data.length} conquistadas</p>}
        >
          Badges
        </SectionTitle>
        <BadgeGrid badges={badges.data} />
      </section>
    </div>
  );
}
