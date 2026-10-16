const pt = 'pt-BR';

export function formatDuration(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

export function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat(pt, { day: 'numeric', month: 'short' })
    .format(new Date(iso))
    .replace('.', '');
}

export function formatLongDate(iso: string): string {
  return new Intl.DateTimeFormat(pt, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
}

export function formatMemberSince(iso: string): string {
  return new Intl.DateTimeFormat(pt, { month: 'short', year: 'numeric' })
    .format(new Date(iso))
    .replace('.', '')
    .replace(' de ', ' ');
}

export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const diffMin = Math.round((now.getTime() - new Date(iso).getTime()) / 60_000);
  const rtf = new Intl.RelativeTimeFormat(pt, { numeric: 'auto' });
  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return rtf.format(-diffMin, 'minute');
  if (diffMin < 60 * 24) return rtf.format(-Math.round(diffMin / 60), 'hour');
  const days = Math.round(diffMin / (60 * 24));
  if (days <= 7) return rtf.format(-days, 'day');
  return formatShortDate(iso);
}

/** "até domingo": o corte semanal é segunda 00h, então o prazo termina no dia anterior. */
export function formatDeadline(expiraEm: string): string {
  const lastDay = new Date(new Date(expiraEm).getTime() - 1);
  return `até ${new Intl.DateTimeFormat(pt, { weekday: 'long' }).format(lastDay)}`;
}

export function formatPoints(points: number): string {
  return `${points.toLocaleString(pt)} pts`;
}

export function ordinal(position: number): string {
  return `${position}º`;
}

export function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

export function fullName(person: { nome: string; sobrenome: string }): string {
  return `${person.nome} ${person.sobrenome}`;
}

/** Data local de hoje no formato yyyy-mm-dd (valor de <input type="date">). */
export function todayISODate(): string {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

/** "Ana", "Ana e Caio", "Ana, Caio e Lia". */
export function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} e ${names[names.length - 1]}`;
}
