import { createContext, useContext } from 'react';
import type { Session } from '../services/http';
export const AuthContext = createContext<{ session: Session | null; isLoading: boolean; error: Error | null; retry: () => void } | null>(null);
export function useSession() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('AuthProvider ausente.');
  return value;
}
