/** Junta nomes de classe ignorando valores falsos. */
export function cx(...names: Array<string | false | null | undefined>): string {
  return names.filter(Boolean).join(' ');
}
