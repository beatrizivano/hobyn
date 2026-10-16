import { Plus, Settings, Star } from 'lucide-react';
import { useMatch } from 'react-router-dom';
import { IconLink } from './IconButton';
import styles from './BottomNav.module.css';

/** Rodapé: conquistas, novo registro (destaque) e configurações. */
export function BottomNav() {
  const inGroup = useMatch('/grupos/:groupId');
  const newRecordTo = inGroup ? `/registros/novo?grupo=${inGroup.params.groupId}` : '/registros/novo';

  return (
    <nav className={styles.nav} aria-label="Navegação principal">
      <IconLink to="/conquistas" label="Conquistas" icon={<Star size={20} aria-hidden="true" />} />
      <IconLink to={newRecordTo} label="Novo registro" variant="dark" size="lg" icon={<Plus size={26} aria-hidden="true" />} />
      <IconLink to="/configuracoes" label="Configurações" icon={<Settings size={20} aria-hidden="true" />} />
    </nav>
  );
}
