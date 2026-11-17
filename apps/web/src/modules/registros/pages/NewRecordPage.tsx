import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, ButtonLink, ScreenHeader, StateMessage } from '../../../components/common';
import { useCurrentUser } from '../../../hooks/useAuth';
import { useGroups } from '../../../hooks/useGrupos';
import { useCreateRecord, useHobbyCatalog } from '../../../hooks/useRegistros';
import type { RegistroFormInput } from '../../../types/domain';
import { RecordForm } from '../components/RecordForm';
import styles from './NewRecordPage.module.css';
export function NewRecordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const groupId = params.get('grupo') ?? undefined;
  const user = useCurrentUser();
  const groups = useGroups();
  const catalog = useHobbyCatalog();
  const create = useCreateRecord();
  if (groups.isLoading || catalog.isLoading || user.isLoading) return <StateMessage kind="loading" />;
  if (!groups.data || !catalog.data || !user.data || groups.error || catalog.error) return <StateMessage kind="error" action={<Button onClick={() => { void groups.refetch(); void catalog.refetch(); }}>Tentar novamente</Button>}>{groups.error?.message ?? catalog.error?.message ?? 'Não foi possível carregar os dados.'}</StateMessage>;
  const activeGroups = groups.data.filter(group => !group.endsAt || new Date(group.endsAt) > new Date());
  if (groupId && !activeGroups.some(group => group.id === groupId)) return <StateMessage kind="error" title="Grupo indisponível para novos registros" action={<ButtonLink to="/registros/novo">Escolher outro grupo</ButtonLink>}>O grupo pode ter sido encerrado ou você não possui mais acesso.</StateMessage>;
  async function submit(input: RegistroFormInput) {
    if (!input.foto) return;
    try {
      const result = await create.mutateAsync({ ...input, foto: input.foto });
      const message = result.semPontuacaoUserIds.length ? 'Registro salvo. Um ou mais participantes atingiram o limite diário e não receberam novos pontos. A atividade continua no histórico.' : 'Atividade registrada com sucesso.';
      navigate(`/grupos/${input.grupoId}`, { state: { recordMessage: message } });
    } catch { /* A mutação exibe a mensagem no formulário e preserva os campos. */ }
  }
  return <div className={styles.page}><ScreenHeader title="Novo registro" backTo={groupId ? `/grupos/${groupId}` : '/'} />
    {activeGroups.length ? <RecordForm grupos={activeGroups} catalogo={catalog.data} initialGroupId={groupId} currentUserId={user.data.id} onSubmit={submit} error={create.error?.message} /> : <StateMessage kind="empty" title="Você precisa de um grupo ativo" action={<ButtonLink to="/grupos/novo">Criar grupo</ButtonLink>}>Grupos encerrados ficam disponíveis apenas para leitura.</StateMessage>}
  </div>;
}
