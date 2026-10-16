import { Avatar } from '../../../components/common';
import type { Usuario } from '../../../types/domain';
import { formatMemberSince, fullName } from '../../../utils/format';
import styles from './ProfileHeader.module.css';

interface ProfileHeaderProps {
  user: Usuario;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <section className={styles.header} aria-label="Dados do usuário">
      <Avatar name={fullName(user)} src={user.fotoDePerfil} size="xl" />
      <h2 className={styles.name}>{fullName(user)}</h2>
      <p className={styles.since}>Membro desde {formatMemberSince(user.createdAt)}</p>
    </section>
  );
}
