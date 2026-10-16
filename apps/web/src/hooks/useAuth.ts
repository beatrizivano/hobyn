import { metaTelaMinutos, usuarioAtual } from '../mocks/data';
import type { Usuario } from '../types/domain';
import { ready, type QueryState } from './queryState';

export function useCurrentUser(): QueryState<Usuario> {
  return ready(usuarioAtual);
}

/** Meta diária de tempo de tela definida pelo usuário (objetivoUsuario). Nula = sem meta. */
export function useScreenTimeGoal(): QueryState<number | null> {
  return ready(metaTelaMinutos);
}

export function useLogout(): () => void {
  // TODO: chamar o service de auth (revogar sessão) e limpar o estado local.
  return () => undefined;
}
