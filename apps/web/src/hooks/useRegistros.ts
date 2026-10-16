import { hobbyCatalogo, registros } from '../mocks/data';
import type { Hobby, Registro } from '../types/domain';
import { ready, type QueryState } from './queryState';

export function useRecord(recordId: string): QueryState<Registro> {
  return ready(registros.find((r) => r.id === recordId));
}

/** Catálogo global (inclui "Outro"). O filtro por grupo é feito pelo formulário. */
export function useHobbyCatalog(): QueryState<Hobby[]> {
  return ready(hobbyCatalogo);
}
