import { ButtonLink, ScreenHeader, SectionTitle, StateMessage } from '../../../components/common';
import { useCurrentUser } from '../../../hooks/useAuth';
import { useBadges, useUserStats } from '../../../hooks/useGamificacao';
import { HobbyTags } from '../components/HobbyTags';
import { PastGroupsList } from '../components/PastGroupsList';
import { ProfileHeader } from '../components/ProfileHeader';
import { StatsRow } from '../components/StatsRow';
import styles from './ProfilePage.module.css';

export function ProfilePage() {
  const user = useCurrentUser();
  const stats = useUserStats();
  const badges = useBadges();

  if (user.isLoading || stats.isLoading || badges.isLoading) return <StateMessage kind="loading" />;
  if (!user.data || !stats.data || !badges.data) {
    return <StateMessage kind="error">Não foi possível carregar seu perfil. Tente de novo em instantes.</StateMessage>;
  }

  const earned = badges.data.filter((badge) => badge.conquistadoEm !== null).length;

  return (
    <div className={styles.page}>
      <ScreenHeader title="Perfil" backTo="/" />
      <ProfileHeader user={user.data} />
      <StatsRow registros={stats.data.registros} minutos={stats.data.minutos} badges={earned} />
      <section aria-labelledby="perfil-hobbies">
        <SectionTitle id="perfil-hobbies">Hobbies</SectionTitle>
        <HobbyTags hobbies={stats.data.hobbiesPraticados} />
      </section>
      <section aria-labelledby="perfil-anteriores">
        <SectionTitle id="perfil-anteriores">Grupos anteriores</SectionTitle>
        <PastGroupsList grupos={stats.data.gruposAnteriores} />
      </section>
      <ButtonLink to="/perfil/editar" fullWidth>Editar perfil</ButtonLink>
    </div>
  );
}
