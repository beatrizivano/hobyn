import { Outlet } from 'react-router-dom';
import { BottomNav } from '../components/common';
import { DesktopSidebar } from './DesktopSidebar';
import styles from './layout.module.css';

/** Telas principais: conteúdo + rodapé de navegação. */
export function AppLayout() {
  return (
    <div className={`${styles.shell} ${styles.appShell}`}>
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <DesktopSidebar />
      <main id="conteudo" className={`${styles.main} ${styles.appMain}`}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
