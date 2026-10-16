import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ButtonLink, ScreenHeader, SegmentedControl, StateMessage } from '../../../components/common';
import { useCurrentUser } from '../../../hooks/useAuth';
import { useGroup, useGroupFeed, useGroupRanking } from '../../../hooks/useGrupos';
import { RecordCard } from '../../registros';
import { GroupInfo } from '../components/GroupInfo';
import { RankingList } from '../components/RankingList';
import styles from './GroupPage.module.css';

type Tab = 'feed' | 'ranking';

/** Grupo: feed de registros e ranking. */
export function GroupPage() {
  const { groupId = '' } = useParams();
  const user = useCurrentUser();
  const group = useGroup(groupId);
  const feed = useGroupFeed(groupId);
  const ranking = useGroupRanking(groupId);
  const [tab, setTab] = useState<Tab>('feed');

  if (group.isLoading || user.isLoading) return <StateMessage kind="loading" />;
  if (!group.data || !user.data) {
    return <StateMessage kind="error" title="Grupo não encontrado">Ele pode ter sido encerrado ou removido.</StateMessage>;
  }

  const grupo = group.data;
  const registros = feed.data ?? [];

  return (
    <div className={styles.page}>
      <ScreenHeader title={grupo.nome} subtitle={`${grupo.membros.length} membros`} backTo="/" />
      <GroupInfo grupo={grupo} />
      <SegmentedControl<Tab>
        label="Conteúdo do grupo"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'feed', label: 'Feed' },
          { value: 'ranking', label: 'Ranking' },
        ]}
      />
      {tab === 'feed' ? (
        <section aria-label="Registros do grupo" className={styles.panel}>
          {registros.length === 0 ? (
            <StateMessage
              kind="empty"
              title="Ainda não há registros"
              action={<ButtonLink to={`/registros/novo?grupo=${grupo.id}`} variant="primary">Registrar atividade</ButtonLink>}
            >
              Que tal ser o primeiro a registrar?
            </StateMessage>
          ) : (
            <>
              <ul className={styles.feed}>
                {registros.map((registro) => (
                  <li key={registro.id}>
                    <RecordCard registro={registro} />
                  </li>
                ))}
              </ul>
              {/* Feed finito: sinaliza o fim em vez de rolar para sempre. */}
              <p className={styles.end}>Você viu tudo por enquanto.</p>
            </>
          )}
        </section>
      ) : (
        <section aria-label="Ranking do grupo" className={styles.panel}>
          {(ranking.data ?? []).length === 0 ? (
            <StateMessage kind="empty" title="O ranking começa no primeiro registro" />
          ) : (
            <RankingList entries={ranking.data ?? []} currentUserId={user.data.id} />
          )}
        </section>
      )}
    </div>
  );
}
