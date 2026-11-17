import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../services/http';
import { authService } from '../services/auth.service';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const session = useSyncExternalStore(api.subscribe, api.getSession);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [attempt, setAttempt] = useState(0);
  const queryClient = useQueryClient();
  useEffect(() => {
    let active = true;
    authService.restore().then(() => { if (active) { setLoading(false); setError(null); } })
      .catch((failure: Error) => { if (active) { setLoading(false); setError(failure); } });
    return () => { active = false; };
  }, [attempt]);
  useEffect(() => {
    let userId = api.getSession()?.user.id;
    return api.subscribe(() => {
      const nextId = api.getSession()?.user.id;
      if (nextId) setError(null);
      if (nextId !== userId) queryClient.clear();
      userId = nextId;
    });
  }, [queryClient]);
  return <AuthContext.Provider value={{ session, isLoading, error, retry: () => { setLoading(true); setError(null); setAttempt(value => value + 1); } }}>{children}</AuthContext.Provider>;
}
