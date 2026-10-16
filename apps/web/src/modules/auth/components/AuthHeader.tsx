import styles from './AuthHeader.module.css';

export function AuthHeader() {
  return (
    <div className={styles.brand}>
      <span className={styles.wordmark}>Hobyn</span>
      <p className={styles.tagline}>Registre seus hobbies e deixe a tela de lado.</p>
    </div>
  );
}
