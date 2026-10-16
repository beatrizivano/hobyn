import { StatCard } from '../../../components/common';
import styles from './StatsRow.module.css';

interface StatsRowProps {
  registros: number;
  minutos: number;
  badges: number;
}

export function StatsRow({ registros, minutos, badges }: StatsRowProps) {
  return (
    <ul className={styles.row}>
      <li><StatCard value={registros} label="Registros" /></li>
      <li><StatCard value={`${Math.floor(minutos / 60)}h`} label="Horas" /></li>
      <li><StatCard value={badges} label="Badges" /></li>
    </ul>
  );
}
