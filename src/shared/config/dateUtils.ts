import { getLocaleBundle, type Locale, type LocaleDictionary } from './locale';

/** Get short month labels for the current locale */
export function getMonthLabels(locale: Locale): string[] {
  return getLocaleBundle(locale).monthsShort;
}

/** Get full month names for the current locale */
export function getFullMonthNames(locale: Locale): string[] {
  return getLocaleBundle(locale).monthsFull;
}

/**
 * Format a date label for chat separators.
 * Returns "Сегодня"/"Today", "Вчера"/"Yesterday", or a locale-formatted date
 * (e.g. "29 мая"/"May 29", "29 de mayo"/"29. Mai").
 */
export function formatDateLabel(iso: string, locale: Locale, t: LocaleDictionary): string {
  const d = new Date(iso);
  const now = new Date();

  const isSameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  if (isSameDay) return t.today;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate();

  if (isYesterday) return t.yesterday;

  const { monthsFull, date: cfg } = getLocaleBundle(locale);
  const day = d.getDate();
  const month = monthsFull[d.getMonth()];
  const dayMonth = cfg.dayFirst
    ? `${day}${cfg.dayMonthJoin}${month}`
    : `${month}${cfg.dayMonthJoin}${day}`;

  if (d.getFullYear() === now.getFullYear()) {
    return dayMonth;
  }
  return `${dayMonth}${cfg.yearJoin}${d.getFullYear()}`;
}

/**
 * Format time as HH:MM (always 24h, no AM/PM).
 */
export function formatTime(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Format scheduled date+time for display (always 24h time).
 */
export function formatScheduledAt(iso: string, locale: Locale): string {
  const d = new Date(iso);
  const dd = d.getDate().toString().padStart(2, '0');
  const mm = (d.getMonth() + 1).toString().padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = d.getHours().toString().padStart(2, '0');
  const mi = d.getMinutes().toString().padStart(2, '0');

  const { numericSeparator, numericDayFirst } = getLocaleBundle(locale).date;
  const dayMonth = numericDayFirst
    ? `${dd}${numericSeparator}${mm}`
    : `${mm}${numericSeparator}${dd}`;
  return `${dayMonth}${numericSeparator}${yyyy} ${hh}:${mi}`;
}

/**
 * Format a relative date label (for scheduled items).
 * Returns "Сегодня"/"Today", "Завтра"/"Tomorrow", or locale-formatted date.
 */
export function formatRelativeDate(iso: string, locale: Locale, t: LocaleDictionary): string {
  const d = new Date(iso);
  const now = new Date();

  const isSameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  if (isSameDay) return t.today;

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow =
    d.getFullYear() === tomorrow.getFullYear() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getDate() === tomorrow.getDate();

  if (isTomorrow) return t.tomorrow;

  const { localeTag } = getLocaleBundle(locale).date;
  return d.toLocaleDateString(localeTag, {
    day: 'numeric',
    month: 'long',
  });
}

/**
 * "When" label for scheduled list rows (Scheduled tab / Future timeline).
 * periodic → everyNMin; one-shot → time / tomorrow+time / short date+time.
 */
export function formatScheduledWhen(
  message: {
    type: string;
    scheduledAt: string | null;
    intervalMinutes: number | null;
  },
  locale: Locale,
  t: LocaleDictionary,
): string {
  if (message.type === 'periodic') {
    return t.everyNMin(message.intervalMinutes ?? 0);
  }
  if (!message.scheduledAt) return '';

  const date = new Date(message.scheduledAt);
  const now = new Date();
  const time = formatTime(message.scheduledAt);

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
  if (isToday) return time;

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow =
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear();
  if (isTomorrow) return `${t.tomorrow} ${time}`;

  const { localeTag } = getLocaleBundle(locale).date;
  return (
    date.toLocaleDateString(localeTag, {
      day: 'numeric',
      month: 'short',
    }) + ` ${time}`
  );
}

/**
 * Format interval in minutes to human-readable string.
 * Examples: "5 мин" / "5 min", "2 ч 30 мин" / "2h 30min", "1 дн" / "1d"
 */
export function formatInterval(minutes: number, t: LocaleDictionary): string {
  if (minutes < 60) {
    return `${minutes} ${t.minutes}`;
  }

  if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours} ${t.hours}`;
    }
    return `${hours} ${t.hours} ${mins} ${t.minutes}`;
  }

  const days = Math.floor(minutes / 1440);
  return `${days} ${t.days}`;
}

/**
 * Format short month name for search results.
 */
export function formatShortMonth(date: Date, locale: Locale): string {
  return getLocaleBundle(locale).monthsShort[date.getMonth()];
}
