import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../../services/auth.service';
import { errorMessage } from '../../../services/http';
import { safeReturnPath } from '../../../utils/returnPath';
import { AuthHeader } from '../components/AuthHeader';
import { LoginForm, type LoginValues } from '../components/LoginForm';
import styles from './AuthPage.module.css';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string>();
  const target = safeReturnPath(location.state?.from);
  async function handleSubmit(values: LoginValues) {
    setError(undefined);
    try { await authService.login(values); navigate(target, { replace: true }); }
    catch (failure) { setError(errorMessage(failure)); }
  }
  return <div className={styles.page}><AuthHeader /><h1 className={styles.title}>Entrar</h1>
    {location.state?.from && <p>Entre para continuar.</p>}
    <LoginForm error={error} onSubmit={handleSubmit} />
    <p className={styles.switch}>Ainda não tem conta? <Link to="/cadastro" state={{ from: target }}>Criar conta</Link></p>
  </div>;
}
