import { Outlet } from 'react-router-dom';
import styles from './layout.module.css';

/** Telas de tarefa (formulários, detalhe, login): sem rodapé, para manter o foco. */
export function FocusLayout() {
  return (
    <div className={`${styles.shell} ${styles.focusShell}`}>
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <main id="conteudo" className={`${styles.main} ${styles.focusMain}`}>
        <Outlet />
      </main>
    </div>
  );
}
