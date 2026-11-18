import { Button } from '../../../components/common';
import styles from './AccountActions.module.css';

interface AccountActionsProps {
  busy?: boolean;
  onLogout: () => void;
  onDeleteAccount: () => void;
}

export function AccountActions({ onLogout, onDeleteAccount, busy }: AccountActionsProps) {
  function confirmDelete() {
    if (busy) return;
    const ok = window.confirm(
      'Excluir sua conta? Você deixa de aparecer nos grupos, mas o histórico dos grupos que você participou é mantido.',
    );
    if (ok) onDeleteAccount();
  }

  return (
    <div className={styles.actions}>
      <Button fullWidth disabled={busy} onClick={onLogout}>Sair</Button>
      <Button variant="ghost" fullWidth disabled={busy} onClick={confirmDelete}>Excluir minha conta</Button>
    </div>
  );
}
