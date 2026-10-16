import { Button } from '../../../components/common';
import styles from './AccountActions.module.css';

interface AccountActionsProps {
  onLogout: () => void;
  onDeleteAccount: () => void;
}

export function AccountActions({ onLogout, onDeleteAccount }: AccountActionsProps) {
  function confirmDelete() {
    const ok = window.confirm(
      'Excluir sua conta? Você deixa de aparecer nos grupos, mas o histórico dos grupos que você participou é mantido.',
    );
    if (ok) onDeleteAccount();
  }

  return (
    <div className={styles.actions}>
      <Button fullWidth onClick={onLogout}>Sair</Button>
      <Button variant="ghost" fullWidth onClick={confirmDelete}>Excluir minha conta</Button>
    </div>
  );
}
