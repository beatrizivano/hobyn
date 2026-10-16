/**
 * Formato de retorno dos hooks de dados, idêntico ao do TanStack Query
 * (`data`, `isLoading`, `error`). Enquanto a API não está ligada, os hooks
 * devolvem dados de `mocks/`; ao integrar, trocar o corpo por `useQuery(...)`
 * sem mexer nas telas.
 */
export interface QueryState<T> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
}

export function ready<T>(data: T | undefined): QueryState<T> {
  return { data, isLoading: false, error: null };
}
