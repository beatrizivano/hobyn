import { useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Button, ButtonLink, ScreenHeader, SegmentedControl, StateMessage } from '../../../components/common';
import { useGroup, useGroupFeed, useUpdateGroup } from '../../../hooks/useGrupos';
import { RecordCard } from '../../registros';
import { useHobbyCatalog } from '../../../hooks/useRegistros';
import type { NovoGrupoInput } from '../../../types/domain';
import { GroupForm } from '../components/GroupForm';
import { GroupInfo } from '../components/GroupInfo';
import styles from './GroupPage.module.css';
type Tab = 'feed' | 'ranking';
export function GroupPage() {
  const { groupId = '' } = useParams();
  const { state } = useLocation();
  const group = useGroup(groupId);
  const feed = useGroupFeed(groupId);
  const [tab, setTab] = useState<Tab>('feed');
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
    <GroupInfo grupo={grupo} />
    {grupo.meuPapel === 'admin' && !encerrado && <Button onClick={() => setEditing(value => !value)}>{editing ? 'Cancelar edição' : 'Configurar grupo'}</Button>}
    {editing && (catalog.isLoading ? <StateMessage kind="loading" /> : catalog.error || !catalog.data ? <StateMessage kind="error">Não foi possível carregar os hobbies.</StateMessage> : <GroupForm catalogo={catalog.data} initialValues={grupo} onSubmit={save} error={update.error?.message} />)}
    <SegmentedControl<Tab> label="Conteúdo do grupo" value={tab} onChange={setTab} options={[{ value: 'feed', label: 'Feed' }, { value: 'ranking', label: 'Ranking' }]} />
    {tab === 'ranking' ? <StateMessage kind="empty" title="Ranking em breve">A classificação será exibida quando a consulta de pontuação estiver disponível.</StateMessage> : <section aria-label="Registros do grupo" className={styles.panel}>
      {feed.isLoading ? <StateMessage kind="loading" /> : <>
        {feed.error && <StateMessage kind="error" action={<Button onClick={() => { void feed.refetch(); }}>Tentar novamente</Button>}>{feed.error.message}</StateMessage>}
        {!feed.error && records.length === 0 && <StateMessage kind="empty" title="Ainda não há registros" action={!encerrado ? <ButtonLink to={`/registros/novo?grupo=${grupo.id}`} variant="primary">Registrar atividade</ButtonLink> : undefined}>{encerrado ? 'Este grupo foi encerrado e está disponível apenas para leitura.' : 'As atividades deste grupo aparecerão aqui.'}</StateMessage>}
        {records.length > 0 && <ul className={styles.feed}>{records.map(record => <li key={record.id}><RecordCard registro={record} /></li>)}</ul>}
        {feed.hasNextPage ? <Button disabled={feed.isFetchingNextPage} onClick={() => { void feed.fetchNextPage(); }}>{feed.isFetchingNextPage ? 'Carregando…' : 'Carregar mais'}</Button> : records.length > 0 && !feed.error && <p className={styles.end}>Você viu tudo por enquanto.</p>}
      </>}
    </section>}
  </div>;
}
