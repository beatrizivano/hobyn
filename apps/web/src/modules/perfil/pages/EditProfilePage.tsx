import { useNavigate } from 'react-router-dom';
import { ScreenHeader, StateMessage } from '../../../components/common';
import { useCurrentUser } from '../../../hooks/useAuth';
import { ProfileForm, type ProfileFormValues } from '../components/ProfileForm';
import styles from './EditProfilePage.module.css';

export function EditProfilePage() {
  const navigate = useNavigate();
  const user = useCurrentUser();

  if (user.isLoading) return <StateMessage kind="loading" />;
  if (!user.data) return <StateMessage kind="error">Não foi possível carregar seus dados.</StateMessage>;

  async function handleSubmit(_values: ProfileFormValues) {
    // TODO: usuarios.service.update(_values) via PATCH /api/users/me.
    navigate('/perfil');
  }

  return (
    <div className={styles.page}>
      <ScreenHeader title="Editar perfil" backTo="/perfil" />
      <ProfileForm user={user.data} onSubmit={handleSubmit} />
    </div>
  );
}
