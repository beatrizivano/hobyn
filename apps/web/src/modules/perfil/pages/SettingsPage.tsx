import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenHeader, SectionTitle, StateMessage } from '../../../components/common';
import { authService } from '../../../services/auth.service';
import { errorMessage } from '../../../services/http';
import { AccountActions } from '../components/AccountActions';
import styles from './SettingsPage.module.css';
export function SettingsPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  async function perform(action: () => Promise<void>) {
    setBusy(true); setError(undefined);
    try { await action(); navigate('/login', { replace: true }); }
    catch (failure) { setError(errorMessage(failure)); }
    finally { setBusy(false); }
  }
  return <div className={styles.page}><ScreenHeader title="Configurações" backTo="/" />
    <section aria-labelledby="config-conta"><SectionTitle id="config-conta">Conta</SectionTitle>
      {error && <p role="alert">{error}</p>}
      <AccountActions busy={busy} onLogout={() => { void perform(authService.logout); }} onDeleteAccount={() => { void perform(authService.deleteAccount); }} />
    </section>
    <StateMessage kind="empty" title="Tempo de tela em breve">As metas de tempo de tela ainda não estão disponíveis.</StateMessage>
  </div>;
}
