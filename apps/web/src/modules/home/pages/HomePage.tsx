import { Button, ButtonLink, SectionTitle, StateMessage } from '../../../components/common';
import { useCurrentUser } from '../../../hooks/useAuth';
import { useGroups } from '../../../hooks/useGrupos';
import { GroupList } from '../../grupos';
import { HomeHeader } from '../components/HomeHeader';
import styles from './HomePage.module.css';
export function HomePage() {
  const user = useCurrentUser();
  const groups = useGroups();
  if (user.isLoading || groups.isLoading) return <StateMessage kind="loading" />;
  if (!user.data || groups.error || !groups.data) return <StateMessage kind="error" action={<Button onClick={() => { void groups.refetch(); }}>Tentar novamente</Button>}>{groups.error?.message ?? 'Não foi possível carregar sua página inicial.'}</StateMessage>;
  return <div className={styles.page}><HomeHeader user={user.data} />
    <section aria-labelledby="home-grupos"><SectionTitle id="home-grupos">Grupos</SectionTitle>
      {groups.data.length === 0 ? <StateMessage kind="empty" title="Você ainda não está em um grupo">Crie seu primeiro grupo para começar.</StateMessage> : <GroupList grupos={groups.data} />}
      <div className={styles.actions}><ButtonLink to="/grupos/novo" fullWidth>Criar grupo</ButtonLink><ButtonLink to="/grupos/entrar" fullWidth>Entrar com código</ButtonLink></div>
    </section>
  </div>;
}
