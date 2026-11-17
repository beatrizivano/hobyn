import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenHeader, StateMessage } from '../../../components/common';
import { useCurrentUser } from '../../../hooks/useAuth';
import { authService } from '../../../services/auth.service';
import { errorMessage } from '../../../services/http';
import { ProfileForm, type ProfileFormValues } from '../components/ProfileForm';
import styles from './EditProfilePage.module.css';
export function EditProfilePage() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const [error, setError] = useState<string>();
  if (user.isLoading) return <StateMessage kind="loading" />;
  if (!user.data) return <StateMessage kind="error">Não foi possível carregar seus dados.</StateMessage>;
  async function handleSubmit(values: ProfileFormValues) {
    setError(undefined);
    try { await authService.updateProfile(values); navigate('/perfil'); }
    catch (failure) { setError(errorMessage(failure)); }
  }
  return <div className={styles.page}><ScreenHeader title="Editar perfil" backTo="/perfil" />
    <ProfileForm user={user.data} onSubmit={handleSubmit} error={error} />
  </div>;
}
