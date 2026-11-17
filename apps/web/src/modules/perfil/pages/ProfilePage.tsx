import { ButtonLink, ScreenHeader, StateMessage } from '../../../components/common';
import { useCurrentUser } from '../../../hooks/useAuth';
import { ProfileHeader } from '../components/ProfileHeader';
import styles from './ProfilePage.module.css';
export function ProfilePage() {
  const user = useCurrentUser();
  if (user.isLoading) return <StateMessage kind="loading" />;
  if (!user.data) return <StateMessage kind="error">Não foi possível carregar seu perfil.</StateMessage>;
  return <div className={styles.page}><ScreenHeader title="Perfil" backTo="/" />
    <ProfileHeader user={user.data} />
    <ButtonLink to="/perfil/editar" fullWidth>Editar perfil</ButtonLink>
    <StateMessage kind="empty" title="Estatísticas em breve">Suas estatísticas e conquistas aparecerão aqui quando estiverem disponíveis.</StateMessage>
  </div>;
}
