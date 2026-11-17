import type { Usuario } from '../types/domain';
import { useSession } from '../contexts/AuthContext';
import { authService } from '../services/auth.service';
import { ready, type QueryState } from './queryState';

export function useCurrentUser(): QueryState<Usuario> {
  const { session, isLoading, error } = useSession();
  return { data: session?.user, isLoading, error };
}
export function useScreenTimeGoal(): QueryState<number | null> { return ready(null); }
export function useLogout() { return authService.logout; }
