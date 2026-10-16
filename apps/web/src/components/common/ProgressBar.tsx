import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  value: number;
  max?: number;
  label: string;
}

export function ProgressBar({ value, max = 100, label }: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      className={styles.track}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(value, max)}
    >
      <div className={styles.fill} style={{ width: `${percent}%` }} />
    </div>
  );
}
