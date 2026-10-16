import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthHeader } from '../components/AuthHeader';
import { LoginForm, type LoginValues } from '../components/LoginForm';
import styles from './AuthPage.module.css';

export function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string>();

  async function handleSubmit(_values: LoginValues) {
    // TODO: auth.service.login(_values). Em falha: setError('E-mail ou senha incorretos.')
    setError(undefined);
    navigate('/');
  }

  return (
    <div className={styles.page}>
      <AuthHeader />
      <h1 className={styles.title}>Entrar</h1>
      <LoginForm error={error} onSubmit={handleSubmit} />
      <p className={styles.switch}>
        Ainda não tem conta? <Link to="/cadastro">Criar conta</Link>
      </p>
    </div>
  );
}
