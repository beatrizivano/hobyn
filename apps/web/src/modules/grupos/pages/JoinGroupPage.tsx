import { ButtonLink, ScreenHeader, StateMessage } from '../../../components/common';
import styles from './JoinGroupPage.module.css';
export function JoinGroupPage() {
  return <div className={styles.page}><ScreenHeader title="Entrar em um grupo" backTo="/" />
    <StateMessage kind="empty" title="Convites em breve" action={<ButtonLink to="/grupos/novo">Criar meu grupo</ButtonLink>}>
      A entrada por código ainda não está disponível. Você já pode criar seus próprios grupos.
    </StateMessage>
  </div>;
}
