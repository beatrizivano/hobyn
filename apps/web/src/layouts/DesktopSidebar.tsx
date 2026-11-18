import { Award, Plus, Settings, UserRound, UsersRound } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Avatar, ButtonLink } from '../components/common';
import { useSession } from '../contexts/AuthContext';
import { cx } from '../utils/cx';
import { fullName } from '../utils/format';
import styles from './DesktopSidebar.module.css';

const destinations = [
  { to: '/', label: 'Grupos', icon: UsersRound, matches: (path: string) => path === '/' || path.startsWith('/grupos') || path.startsWith('/registros') },
  { to: '/conquistas', label: 'Conquistas', icon: Award, matches: (path: string) => path.startsWith('/conquistas') },
  { to: '/perfil', label: 'Perfil', icon: UserRound, matches: (path: string) => path.startsWith('/perfil') },
  { to: '/configuracoes', label: 'Configurações', icon: Settings, matches: (path: string) => path.startsWith('/configuracoes') || path.startsWith('/alterar-senha') },
];

export function DesktopSidebar() {
  const { session } = useSession();
  const { pathname } = useLocation();
  const user = session?.user;

  return (
    <aside className={styles.sidebar} aria-label="Navegação lateral">
      <Link to="/" className={styles.brand} aria-label="Hobyn — página inicial">HOBYN</Link>
      {user && (
        <Link to="/perfil" className={styles.profile}>
          <Avatar name={fullName(user)} src={user.fotoDePerfil} size="lg" />
          <span className={styles.profileCopy}>
            <strong>{fullName(user)}</strong>
            <small>{user.email}</small>
          </span>
        </Link>
      )}
      <nav className={styles.nav} aria-label="Seções principais">
        {destinations.map(({ to, label, icon: Icon, matches }) => {
          const current = matches(pathname);
          return (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={cx(styles.navLink, current && styles.active)}
              aria-current={current ? 'page' : undefined}
            >
              <Icon size={20} aria-hidden="true" />
              {label}
            </NavLink>
          );
        })}
      </nav>
      <ButtonLink to="/registros/novo" variant="primary" fullWidth icon={<Plus size={20} aria-hidden="true" />}>
        Novo registro
      </ButtonLink>
    </aside>
  );
}
