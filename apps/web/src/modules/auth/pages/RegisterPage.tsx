import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../../services/auth.service';
import { errorMessage } from '../../../services/http';
import { safeReturnPath } from '../../../utils/returnPath';
import { AuthHeader } from '../components/AuthHeader';
import { RegisterForm, type RegisterValues } from '../components/RegisterForm';
import styles from './AuthPage.module.css';

export function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string>();
  const target = safeReturnPath(location.state?.from);
  async function handleSubmit(values: RegisterValues) {
    setError(undefined);
    try {
      const result = await authService.register(values);
      navigate(result.activationRequired ? `/ativacao-enviada?email=${encodeURIComponent(result.email)}` : target, { replace: true });
    }
    catch (failure) { setError(errorMessage(failure)); }
  }
  return <div className={styles.page}><AuthHeader /><h1 className={styles.title}>Criar conta</h1>
    <RegisterForm error={error} onSubmit={handleSubmit} />
    <p className={styles.switch}>Já tem conta? <Link to="/login" state={{ from: target }}>Entrar</Link></p>
  </div>;
}
