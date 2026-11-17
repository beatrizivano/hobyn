import { useNavigate } from 'react-router-dom';
import { Button, ScreenHeader, StateMessage } from '../../../components/common';
import { useHobbyCatalog } from '../../../hooks/useRegistros';
import { useCreateGroup } from '../../../hooks/useGrupos';
import type { NovoGrupoInput } from '../../../types/domain';
import { GroupForm } from '../components/GroupForm';
import styles from './CreateGroupPage.module.css';

export function CreateGroupPage() {
  const navigate = useNavigate();
  const catalog = useHobbyCatalog();
  const create = useCreateGroup();
  if (catalog.isLoading) return <StateMessage kind="loading" />;
  if (catalog.error || !catalog.data) return <StateMessage kind="error" action={<Button onClick={() => { void catalog.refetch(); }}>Tentar novamente</Button>}>{catalog.error?.message ?? 'Não foi possível carregar os hobbies.'}</StateMessage>;
  async function handleSubmit(input: NovoGrupoInput) {
    try { const group = await create.mutateAsync(input); navigate(`/grupos/${group.id}`); }
    catch { /* O erro da mutação é mostrado no formulário. */ }
  }
  return <div className={styles.page}><ScreenHeader title="Criar grupo" backTo="/" />
    <GroupForm catalogo={catalog.data} onSubmit={handleSubmit} error={create.error?.message} />
  </div>;
}
