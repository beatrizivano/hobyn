import { useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Button, ButtonLink, Card, PhotoFrame, ScreenHeader, SegmentedControl, StateMessage } from '../../../components/common';
import { useGroup, useGroupFeed, useGroupRanking, useUpdateGroup } from '../../../hooks/useGrupos';
import { RecordCard } from '../../registros';
import { useHobbyCatalog } from '../../../hooks/useRegistros';
import type { NovoGrupoInput } from '../../../types/domain';
import { GroupForm } from '../components/GroupForm';
import { GroupInfo } from '../components/GroupInfo';
import { GroupInvitePanel } from '../components/GroupInvitePanel';
import { RankingList } from '../components/RankingList';
import { useSession } from '../../../contexts/AuthContext';
import { GroupMembersPanel } from '../components/GroupMembersPanel';
import styles from './GroupPage.module.css';
type Tab = 'feed' | 'ranking';
export function GroupPage() {
  const { groupId = '' } = useParams();
  const { state } = useLocation();
  const group = useGroup(groupId);
  const feed = useGroupFeed(groupId);
  const [tab, setTab] = useState<Tab>('feed');
  const ranking = useGroupRanking(groupId, tab === 'ranking');
  const { session } = useSession();
  const [editing, setEditing] = useState(false);
  const catalog = useHobbyCatalog();
  const update = useUpdateGroup(groupId);
  async function save(input: NovoGrupoInput) {
    try { await update.mutateAsync(input); setEditing(false); }
    catch { /* A mutação mostra o erro no formulário. */ }
  }
  if (group.isLoading) return <StateMessage kind="loading" />;
  if (group.error || !group.data) return <StateMessage kind="error" title="Não foi possível abrir o grupo" action={<Button onClick={() => { void group.refetch(); }}>Tentar novamente</Button>}>{group.error?.message ?? 'Grupo não encontrado.'}</StateMessage>;
  const grupo = group.data;
  const encerrado = !!grupo.endsAt && new Date(grupo.endsAt) <= new Date();
  const records = feed.data ?? [];
  return <div className={styles.page}><ScreenHeader title={grupo.nome} subtitle={`${grupo.membros.length} membros`} backTo="/" />
    {typeof state?.recordMessage === 'string' && <p role="status">{state.recordMessage}</p>}
    {typeof state?.inviteMessage === 'string' && <p role="status">{state.inviteMessage}</p>}
    {grupo.foto && <PhotoFrame src={grupo.foto} alt={`Foto do grupo ${grupo.nome}`} ratio="16 / 6" className={styles.cover} />}
    <div className={styles.workspace}>
      <aside className={styles.aside} aria-label="Informações e gestão do grupo">
        <Card as="section" className={styles.infoCard}>
          <h2>Sobre o grupo</h2>
          <GroupInfo grupo={grupo} />
        </Card>
        <GroupMembersPanel grupo={grupo} currentUserId={session?.user.id ?? ''} ended={encerrado} />
        {grupo.meuPapel === 'admin' && !encerrado && <GroupInvitePanel groupId={grupo.id} />}
        {grupo.meuPapel === 'admin' && !encerrado && <Button fullWidth onClick={() => setEditing(value => !value)}>{editing ? 'Cancelar edição' : 'Configurar grupo'}</Button>}
      </aside>
      <div className={styles.primary}>
        <SegmentedControl<Tab> label="Conteúdo do grupo" value={tab} onChange={setTab} options={[{ value: 'feed', label: 'Feed' }, { value: 'ranking', label: 'Ranking' }]} />
        <Card as="section" className={styles.panel} aria-label={tab === 'ranking' ? 'Ranking do grupo' : 'Registros do grupo'}>
          {tab === 'ranking' ? (
            ranking.isLoading ? <StateMessage kind="loading" title="Calculando ranking…" /> : ranking.error ? <StateMessage kind="error" action={<Button onClick={() => { void ranking.refetch(); }}>Tentar novamente</Button>}>{ranking.error.message}</StateMessage> : ranking.data?.length ? <RankingList entries={ranking.data} currentUserId={session?.user.id ?? ''} /> : <StateMessage kind="empty" title="Ranking vazio">Ainda não há membros ativos neste grupo.</StateMessage>
          ) : feed.isLoading ? <StateMessage kind="loading" /> : <>
            {feed.error && <StateMessage kind="error" action={<Button onClick={() => { void feed.refetch(); }}>Tentar novamente</Button>}>{feed.error.message}</StateMessage>}
            {!feed.error && records.length === 0 && <StateMessage kind="empty" title="Ainda não há registros" action={!encerrado ? <ButtonLink to={`/registros/novo?grupo=${grupo.id}`} variant="primary">Registrar atividade</ButtonLink> : undefined}>{encerrado ? 'Este grupo foi encerrado e está disponível apenas para leitura.' : 'As atividades deste grupo aparecerão aqui.'}</StateMessage>}
            {records.length > 0 && <ul className={styles.feed}>{records.map(record => <li key={record.id}><RecordCard registro={record} /></li>)}</ul>}
            {feed.hasNextPage ? <Button disabled={feed.isFetchingNextPage} onClick={() => { void feed.fetchNextPage(); }}>{feed.isFetchingNextPage ? 'Carregando…' : 'Carregar mais'}</Button> : records.length > 0 && !feed.error && <p className={styles.end}>Você viu tudo por enquanto.</p>}
          </>}
        </Card>
      </div>
    </div>
    {editing && <Card as="section" className={styles.editor}>{catalog.isLoading ? <StateMessage kind="loading" /> : catalog.error || !catalog.data ? <StateMessage kind="error">Não foi possível carregar os hobbies.</StateMessage> : <GroupForm catalogo={catalog.data} initialValues={grupo} onSubmit={save} error={update.error?.message} />}</Card>}
  </div>;
}
