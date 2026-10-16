import { useParams } from 'react-router-dom';
import { ScreenHeader, StateMessage } from '../../../components/common';
import { useRecord } from '../../../hooks/useRegistros';
import { RecordDetail } from '../components/RecordDetail';
import styles from './RecordPage.module.css';

export function RecordPage() {
  const { recordId = '' } = useParams();
  const record = useRecord(recordId);

  if (record.isLoading) return <StateMessage kind="loading" />;
  if (record.error || !record.data) {
    return <StateMessage kind="error" title="Registro não encontrado">Ele pode ter sido apagado pelo autor.</StateMessage>;
  }

  return (
    <div className={styles.page}>
      <ScreenHeader title="Registro" backTo={`/grupos/${record.data.grupoId}`} />
      <RecordDetail registro={record.data} />
    </div>
  );
}
