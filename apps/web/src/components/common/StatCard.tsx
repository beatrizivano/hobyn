import { Card } from './Card';
import styles from './StatCard.module.css';

interface StatCardProps {
  value: string | number;
  label: string;
}

export function StatCard({ value, label }: StatCardProps) {
  return (
    <Card className={styles.stat}>
      <p className={styles.value}>{value}</p>
      <p className={styles.label}>{label}</p>
    </Card>
  );
}
