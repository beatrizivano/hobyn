/** Estado de leitura das telas. Os hooks integrados usam TanStack Query. */
export interface QueryState<T> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
}

export function ready<T>(data: T | undefined): QueryState<T> {
  return { data, isLoading: false, error: null };
}
