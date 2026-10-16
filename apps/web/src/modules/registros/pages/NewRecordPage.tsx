import { useNavigate, useSearchParams } from 'react-router-dom';
import { ButtonLink, ScreenHeader, StateMessage } from '../../../components/common';
import { useCurrentUser } from '../../../hooks/useAuth';
import { useGroups } from '../../../hooks/useGrupos';
import { useHobbyCatalog } from '../../../hooks/useRegistros';
import type { NovoRegistroInput } from '../../../types/domain';
import { RecordForm } from '../components/RecordForm';
import styles from './NewRecordPage.module.css';

export function NewRecordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const groupParam = params.get('grupo') ?? undefined;
  const user = useCurrentUser();
  const groups = useGroups();
  const catalog = useHobbyCatalog();

  if (user.isLoading || groups.isLoading || catalog.isLoading) return <StateMessage kind="loading" />;
  if (!user.data || !groups.data || !catalog.data) {
    return <StateMessage kind="error">Não foi possível carregar seus grupos. Tente de novo em instantes.</StateMessage>;
  }

  async function handleSubmit(input: NovoRegistroInput) {
    // TODO: registros.service.create(input) e invalidar a query do feed do grupo.
    navigate(`/grupos/${input.grupoId}`);
  }

  return (
    <div className={styles.page}>
      <ScreenHeader title="Novo registro" backTo={groupParam ? `/grupos/${groupParam}` : '/'} />
      {groups.data.length === 0 ? (
        <StateMessage
          kind="empty"
          title="Você ainda não está em um grupo"
          action={
            <>
              <ButtonLink to="/grupos/novo" variant="primary">Criar grupo</ButtonLink>
              <ButtonLink to="/grupos/entrar">Entrar com código</ButtonLink>
            </>
          }
        >
          Registros acontecem dentro de grupos.
        </StateMessage>
      ) : (
        <RecordForm
          grupos={groups.data}
          catalogo={catalog.data}
          initialGroupId={groupParam}
          currentUserId={user.data.id}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
