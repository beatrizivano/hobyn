import { useNavigate, useParams } from 'react-router-dom';
import { Button, ButtonLink, ScreenHeader, StateMessage } from '../../../components/common';
import { useCurrentUser } from '../../../hooks/useAuth';
import { useDeleteRecord, useRecord } from '../../../hooks/useRegistros';
import { RecordDetail } from '../components/RecordDetail';
import styles from './RecordPage.module.css';
export function RecordPage() {
  const { recordId = '' } = useParams();
  const navigate = useNavigate();
  const record = useRecord(recordId);
  const user = useCurrentUser();
  const remove = useDeleteRecord();
  if (record.isLoading) return <StateMessage kind="loading" />;
  if (record.error || !record.data) return <StateMessage kind="error" title="Registro não encontrado">{record.error?.message ?? 'Ele pode ter sido apagado pelo autor.'}</StateMessage>;
  const own = record.data.criadoPorId === user.data?.id && !record.data.grupoEncerrado;
  async function deleteRecord() {
    if (!record.data || !window.confirm('Excluir este registro e sua foto? Os pontos já concedidos permanecem no histórico.')) return;
    const groupId = record.data.grupoId;
    try { await remove.mutateAsync(recordId); navigate(`/grupos/${groupId}`, { replace: true }); }
    catch { /* O erro da mutação permanece visível. */ }
  }
  return <div className={styles.page}><ScreenHeader title="Registro" backTo={`/grupos/${record.data.grupoId}`} />
    <RecordDetail registro={record.data} />
    {remove.error && <p role="alert">{remove.error.message}</p>}
    {own && <div><ButtonLink to={`/registros/${recordId}/editar`}>Editar registro</ButtonLink><Button disabled={remove.isPending} onClick={() => { void deleteRecord(); }}>{remove.isPending ? 'Excluindo…' : 'Excluir registro'}</Button></div>}
  </div>;
}
