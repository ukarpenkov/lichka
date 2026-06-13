import type { Locale, LocaleDictionary } from './locale';

/** Full month names in genitive case (for "29 мая" style) */
const MONTHS_FULL: Record<Locale, string[]> = {
  ru: [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
  ],
  en: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
};

/** Short month names (for calendar rings, search results) */
const MONTHS_SHORT: Record<Locale, string[]> = {
  ru: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

/** Get short month labels for the current locale */
export function getMonthLabels(locale: Locale): string[] {
  return MONTHS_SHORT[locale];
}

/** Get full month names for the current locale */
export function getFullMonthNames(locale: Locale): string[] {
  return MONTHS_FULL[locale];
}

/**
 * Format a date label for chat separators.
 * Returns "Сегодня"/"Today", "Вчера"/"Yesterday", "29 мая"/"May 29", or "29 мая 2025"/"May 29, 2025"
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

  const months = MONTHS_FULL[locale];
  const day = d.getDate();
  const month = months[d.getMonth()];

  if (locale === 'ru') {
    if (d.getFullYear() === now.getFullYear()) {
      return `${day} ${month}`;
    }
    return `${day} ${month} ${d.getFullYear()}`;
  }

  // English: "May 29" / "May 29, 2025"
  if (d.getFullYear() === now.getFullYear()) {
    return `${month} ${day}`;
  }
  return `${month} ${day}, ${d.getFullYear()}`;
}

/**
 * Format time as HH:MM (locale-neutral, always 24h for consistency).
 * Use toLocaleTimeString for locale-aware 12/24h if needed.
 */
export function formatTime(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Format scheduled date+time for display.
 * Uses toLocaleDateString/toLocaleTimeString with the given locale.
 */
export function formatScheduledAt(iso: string, locale: Locale): string {
  const d = new Date(iso);
  const dd = d.getDate().toString().padStart(2, '0');
  const mm = (d.getMonth() + 1).toString().padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = d.getHours().toString().padStart(2, '0');
  const mi = d.getMinutes().toString().padStart(2, '0');

  if (locale === 'ru') {
    return `${dd}.${mm}.${yyyy} ${hh}:${mi}`;
  }
  return `${mm}/${dd}/${yyyy} ${hh}:${mi}`;
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

  const localeTag = locale === 'ru' ? 'ru-RU' : 'en-US';
  return d.toLocaleDateString(localeTag, {
    day: 'numeric',
    month: 'long',
  });
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
  return MONTHS_SHORT[locale][date.getMonth()];
}
