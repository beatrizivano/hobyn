import { useNavigate } from 'react-router-dom';
import { ScreenHeader, SectionTitle, StateMessage } from '../../../components/common';
import { useLogout, useScreenTimeGoal } from '../../../hooks/useAuth';
import { AccountActions } from '../components/AccountActions';
import { ScreenTimeSettings } from '../components/ScreenTimeSettings';
import styles from './SettingsPage.module.css';

export function SettingsPage() {
  const navigate = useNavigate();
  const goal = useScreenTimeGoal();
  const logout = useLogout();

  if (goal.isLoading) return <StateMessage kind="loading" />;

  return (
    <div className={styles.page}>
      <ScreenHeader title="Configurações" backTo="/" />
      <section aria-labelledby="config-tela">
        <SectionTitle id="config-tela">Tempo de tela</SectionTitle>
        <ScreenTimeSettings
          goalMinutes={goal.data ?? null}
          onSaveGoal={() => undefined /* TODO: objetivoUsuario (tempo_tela_maximo) */}
          onSaveToday={() => undefined /* TODO: registroTempoTela do dia */}
        />
      </section>
      <section aria-labelledby="config-conta">
        <SectionTitle id="config-conta">Conta</SectionTitle>
        <AccountActions
          onLogout={() => {
            logout();
            navigate('/login');
          }}
          onDeleteAccount={() => {
            // TODO: DELETE /api/users/me (exclusão lógica, revoga sessões).
            navigate('/login');
          }}
        />
      </section>
    </div>
  );
}
