import { useNavigate, useParams } from 'react-router-dom';
import { ScreenHeader, StateMessage } from '../../../components/common';
import { useCurrentUser } from '../../../hooks/useAuth';
import { useGroups } from '../../../hooks/useGrupos';
import { useHobbyCatalog, useRecord, useUpdateRecord } from '../../../hooks/useRegistros';
import type { RegistroFormInput } from '../../../types/domain';
import { RecordForm } from '../components/RecordForm';
import styles from './NewRecordPage.module.css';
export function EditRecordPage() {
  const { recordId = '' } = useParams();
  const navigate = useNavigate();
  const record = useRecord(recordId);
  const user = useCurrentUser();
  const groups = useGroups();
  const catalog = useHobbyCatalog();
  const update = useUpdateRecord(recordId);
  if (record.isLoading || groups.isLoading || catalog.isLoading || user.isLoading) return <StateMessage kind="loading" />;
  if (!record.data || !user.data || !groups.data || !catalog.data) return <StateMessage kind="error">Não foi possível carregar o registro para edição.</StateMessage>;
  if (record.data.criadoPorId !== user.data.id || record.data.grupoEncerrado) return <StateMessage kind="error">Somente o autor pode editar o registro em um grupo ativo.</StateMessage>;
  async function submit(input: RegistroFormInput) {
    try { await update.mutateAsync(input); navigate(`/registros/${recordId}`); }
    catch { /* Erro apresentado no formulário. */ }
  }
  return <div className={styles.page}><ScreenHeader title="Editar registro" backTo={`/registros/${recordId}`} />
    <p>A edição não recalcula os pontos já concedidos.</p>
    <RecordForm grupos={groups.data} catalogo={catalog.data} currentUserId={user.data.id} initialRecord={record.data} onSubmit={submit} error={update.error?.message} />
  </div>;
}
