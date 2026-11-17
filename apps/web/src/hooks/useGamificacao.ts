import type { Conquista, PerfilStats, WeeklyChallengeState } from '../types/domain';
import type { QueryState } from './queryState';
function unavailable<T>(): QueryState<T> { return { data: undefined, isLoading: false, error: new Error('Recurso ainda não disponível.') }; }
export function useBadges() { return unavailable<Conquista[]>(); }
export function useWeeklyChallenge() { return unavailable<WeeklyChallengeState>(); }
export function useUserStats() { return unavailable<PerfilStats>(); }
