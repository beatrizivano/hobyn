import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../../services/auth.service';
import { errorMessage } from '../../../services/http';
import { AuthHeader } from '../components/AuthHeader';
import { RegisterForm, type RegisterValues } from '../components/RegisterForm';
import styles from './AuthPage.module.css';

export function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string>();
  async function handleSubmit(values: RegisterValues) {
    setError(undefined);
    try { await authService.register(values); navigate('/', { replace: true }); }
    catch (failure) { setError(errorMessage(failure)); }
  }
  return <div className={styles.page}><AuthHeader /><h1 className={styles.title}>Criar conta</h1>
    <RegisterForm error={error} onSubmit={handleSubmit} />
    <p className={styles.switch}>Já tem conta? <Link to="/login">Entrar</Link></p>
  </div>;
}
