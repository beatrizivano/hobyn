import { ButtonLink, SectionTitle, StateMessage } from '../../../components/common';
import { useCurrentUser } from '../../../hooks/useAuth';
import { useWeeklyChallenge } from '../../../hooks/useGamificacao';
import { useGroups } from '../../../hooks/useGrupos';
import { WeeklyChallengeCard } from '../../gamificacao';
import { GroupList } from '../../grupos';
import { HomeHeader } from '../components/HomeHeader';
import styles from './HomePage.module.css';

/** Home: saudação, grupos do usuário e desafio da semana. */
export function HomePage() {
  const user = useCurrentUser();
  const groups = useGroups();
  const weekly = useWeeklyChallenge();

  if (user.isLoading || groups.isLoading || weekly.isLoading) return <StateMessage kind="loading" />;
  if (!user.data || !groups.data) {
    return <StateMessage kind="error">Não foi possível carregar sua página inicial. Tente de novo em instantes.</StateMessage>;
  }

  return (
    <div className={styles.page}>
      <HomeHeader user={user.data} />

      <section aria-labelledby="home-grupos">
        <SectionTitle id="home-grupos">Grupos</SectionTitle>
        {groups.data.length === 0 ? (
          <StateMessage kind="empty" title="Você ainda não está em um grupo">
            Crie um grupo ou entre com um código de convite.
          </StateMessage>
        ) : (
          <GroupList grupos={groups.data} />
        )}
        <div className={styles.actions}>
          <ButtonLink to="/grupos/novo" fullWidth>Criar grupo</ButtonLink>
          <ButtonLink to="/grupos/entrar" fullWidth>Entrar com código</ButtonLink>
        </div>
      </section>

      {weekly.data && (
        <section aria-labelledby="home-desafio">
          <SectionTitle id="home-desafio">Desafio da semana</SectionTitle>
          <WeeklyChallengeCard
            value={weekly.data}
            onChoose={() => undefined /* TODO: gamificacao.service.chooseChallenge(id) */}
          />
        </section>
      )}
    </div>
  );
}
