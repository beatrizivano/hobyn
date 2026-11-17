import { ScreenHeader, StateMessage } from '../../../components/common';
import styles from './BadgesPage.module.css';
export function BadgesPage() {
  return <div className={styles.page}><ScreenHeader title="Conquistas" backTo="/" />
    <StateMessage kind="empty" title="Conquistas em breve">Suas conquistas aparecerão aqui quando esse recurso estiver disponível.</StateMessage>
  </div>;
}
