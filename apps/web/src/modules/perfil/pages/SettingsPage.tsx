import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, ScreenHeader, SectionTitle, StateMessage } from '../../../components/common';
import { authService } from '../../../services/auth.service';
import { errorMessage } from '../../../services/http';
import { AccountActions } from '../components/AccountActions';
import styles from './SettingsPage.module.css';
export function SettingsPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string>();
  async function perform(action: () => Promise<void>) {
    setBusy(true); setError(undefined);
    try { await action(); navigate('/login', { replace: true }); }
    catch (failure) { setError(errorMessage(failure)); }
    finally { setBusy(false); }
  }
  return <div className={styles.page}><ScreenHeader title="Configurações" backTo="/" />
    <div className={styles.bento}>
      <Card as="section" className={styles.account} aria-labelledby="config-conta"><SectionTitle id="config-conta">Conta</SectionTitle>
        {error && <p role="alert">{error}</p>}
        {passwordMessage && <p role="status">{passwordMessage}</p>}
        <Button fullWidth disabled={busy} onClick={() => { setBusy(true); setError(undefined); authService.requestPasswordChange().then(result => setPasswordMessage(result.message)).catch(failure => setError(errorMessage(failure))).finally(() => setBusy(false)); }}>Alterar senha</Button>
        <AccountActions busy={busy} onLogout={() => { void perform(authService.logout); }} onDeleteAccount={() => { void perform(authService.deleteAccount); }} />
      </Card>
      <Card as="section" tone="dotted" className={styles.upcoming}>
        <StateMessage kind="empty" title="Tempo de tela em breve">As metas de tempo de tela ainda não estão disponíveis.</StateMessage>
      </Card>
    </div>
  </div>;
}
