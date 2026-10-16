import { Link, useNavigate } from 'react-router-dom';
import { AuthHeader } from '../components/AuthHeader';
import { RegisterForm, type RegisterValues } from '../components/RegisterForm';
import styles from './AuthPage.module.css';

export function RegisterPage() {
  const navigate = useNavigate();

  async function handleSubmit(_values: RegisterValues) {
    // TODO: auth.service.register(_values); e-mail já usado deve virar erro no campo.
    navigate('/');
  }

  return (
    <div className={styles.page}>
      <AuthHeader />
      <h1 className={styles.title}>Criar conta</h1>
      <RegisterForm onSubmit={handleSubmit} />
      <p className={styles.switch}>
        Já tem conta? <Link to="/login">Entrar</Link>
      </p>
    </div>
  );
}
