import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Button, StateMessage } from '../components/common';
import { useSession } from '../contexts/AuthContext';

export function ProtectedRoute() {
  const { session, isLoading, error, retry } = useSession();
  const location = useLocation();
  if (isLoading) return <StateMessage kind="loading" title="Verificando sua sessão…" />;
  if (error && !session) return <StateMessage kind="error" action={<Button onClick={retry}>Tentar novamente</Button>}>{error.message}</StateMessage>;
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return <Outlet />;
}
export function GuestRoute() {
  const { session, isLoading } = useSession();
  const { state } = useLocation();
  const target = typeof state?.from === 'string' && state.from.startsWith('/') && !state.from.startsWith('//') ? state.from : '/';
  if (isLoading) return <StateMessage kind="loading" />;
  return session ? <Navigate to={target} replace /> : <Outlet />;
}
