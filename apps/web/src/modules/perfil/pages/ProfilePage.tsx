import { ButtonLink, Card, ScreenHeader, StateMessage } from '../../../components/common';
import { useCurrentUser } from '../../../hooks/useAuth';
import { ProfileHeader } from '../components/ProfileHeader';
import styles from './ProfilePage.module.css';
export function ProfilePage() {
  const user = useCurrentUser();
  if (user.isLoading) return <StateMessage kind="loading" />;
  if (!user.data) return <StateMessage kind="error">Não foi possível carregar seu perfil.</StateMessage>;
  return <div className={styles.page}><ScreenHeader title="Perfil" backTo="/" />
    <div className={styles.bento}>
      <Card as="section" className={styles.identity}><ProfileHeader user={user.data} /></Card>
      <Card as="section" tone="dotted" className={styles.actions}>
        <h2>Dados pessoais</h2>
        <p>Mantenha seu nome e sua foto atualizados para que os grupos reconheçam você.</p>
        <ButtonLink to="/perfil/editar" fullWidth variant="primary">Editar perfil</ButtonLink>
      </Card>
      <Card as="section" className={styles.stats}>
        <StateMessage kind="empty" title="Estatísticas em breve">Suas estatísticas e conquistas aparecerão aqui quando estiverem disponíveis.</StateMessage>
      </Card>
    </div>
  </div>;
}
