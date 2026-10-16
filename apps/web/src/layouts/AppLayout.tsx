import { Outlet } from 'react-router-dom';
import { BottomNav } from '../components/common';
import styles from './layout.module.css';

/** Telas principais: conteúdo + rodapé de navegação. */
export function AppLayout() {
  return (
    <div className={styles.shell}>
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <main id="conteudo" className={styles.main}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
