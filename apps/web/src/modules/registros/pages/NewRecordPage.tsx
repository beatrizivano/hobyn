import { useSearchParams } from 'react-router-dom';
import { ButtonLink, ScreenHeader, StateMessage } from '../../../components/common';
import styles from './NewRecordPage.module.css';
export function NewRecordPage() {
  const [params] = useSearchParams();
  const groupId = params.get('grupo');
  const back = groupId ? `/grupos/${groupId}` : '/';
  return <div className={styles.page}><ScreenHeader title="Novo registro" backTo={back} />
    <StateMessage kind="empty" title="Registro com foto em breve" action={<ButtonLink to={back}>Voltar</ButtonLink>}>
      Para salvar atividades, falta concluir o envio e o armazenamento das fotos obrigatórias.
    </StateMessage>
  </div>;
}
