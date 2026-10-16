import { Link } from 'react-router-dom';
import { Avatar } from '../../../components/common';
import type { Usuario } from '../../../types/domain';
import { fullName } from '../../../utils/format';
import styles from './HomeHeader.module.css';

interface HomeHeaderProps {
  user: Usuario;
}

/**
 * Saudação + acesso ao perfil. O sino de notificações do mockup ficou de fora
 * porque notificações ainda não foram definidas no produto.
 */
export function HomeHeader({ user }: HomeHeaderProps) {
  return (
    <header className={styles.header}>
      <div>
        <p className={styles.greeting}>Olá,</p>
        <h1 className={styles.name}>{user.nome}</h1>
      </div>
      <Link to="/perfil" aria-label="Abrir perfil" className={styles.profile}>
        <Avatar name={fullName(user)} src={user.fotoDePerfil} size="lg" />
      </Link>
    </header>
  );
}
