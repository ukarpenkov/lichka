import {
  getMonthLabels,
  getFullMonthNames,
  getWeekdayShort,
  formatDateLabel,
  formatTime,
  formatScheduledAt,
  formatRelativeDate,
  formatScheduledWhen,
  formatInterval,
  formatShortMonth,
} from '../dateUtils';
import { getDictionary, SUPPORTED_LOCALES } from '../locale';

const ru = getDictionary('ru');
const en = getDictionary('en');
const es = getDictionary('es');
const de = getDictionary('de');
const fr = getDictionary('fr');
const pt = getDictionary('pt');

describe('dateUtils', () => {
  describe('getMonthLabels', () => {
    it('should return 12 labels for every locale', () => {
      for (const locale of SUPPORTED_LOCALES) {
        expect(getMonthLabels(locale)).toHaveLength(12);
      }
    });

    it('should return Russian short months for ru', () => {
      const labels = getMonthLabels('ru');
      expect(labels[0]).toBe('Янв');
      expect(labels[11]).toBe('Дек');
    });

    it('should return short months for new locales', () => {
      expect(getMonthLabels('en')[0]).toBe('Jan');
      expect(getMonthLabels('es')[0]).toBe('Ene');
      expect(getMonthLabels('de')[0]).toBe('Jan');
      expect(getMonthLabels('fr')[0]).toBe('Janv');
      expect(getMonthLabels('pt')[0]).toBe('Jan');
    });
  });

  describe('getFullMonthNames', () => {
    it('should return 12 names for every locale', () => {
      for (const locale of SUPPORTED_LOCALES) {
        expect(getFullMonthNames(locale)).toHaveLength(12);
      }
    });

    it('should return Russian genitive months for ru', () => {
      const names = getFullMonthNames('ru');
      expect(names[0]).toBe('января');
      expect(names[4]).toBe('мая');
    });

    it('should return month names for new locales', () => {
      expect(getFullMonthNames('es')[0]).toBe('enero');
      expect(getFullMonthNames('de')[0]).toBe('Januar');
      expect(getFullMonthNames('fr')[0]).toBe('janvier');
      expect(getFullMonthNames('pt')[0]).toBe('janeiro');
    });
  });

  describe('getWeekdayShort', () => {
    const tuesday = new Date(2026, 7, 25);

    it('should return Russian Tuesday abbreviation for ru', () => {
      expect(getWeekdayShort(tuesday, 'ru')).toBe('ВТ');
    });

    it('should return English Tuesday abbreviation for en', () => {
      expect(getWeekdayShort(tuesday, 'en')).toBe('TU');
    });

    it('should change abbreviation when locale changes', () => {
      expect(getWeekdayShort(tuesday, 'es')).toBe('MA');
      expect(getWeekdayShort(tuesday, 'de')).toBe('DI');
      expect(getWeekdayShort(tuesday, 'fr')).toBe('MA');
      expect(getWeekdayShort(tuesday, 'pt')).toBe('TER');
    });

    it('should return Sunday abbreviation at Date.getDay() index 0', () => {
      const sunday = new Date(2026, 7, 30);
      expect(getWeekdayShort(sunday, 'ru')).toBe('ВС');
      expect(getWeekdayShort(sunday, 'en')).toBe('SU');
    });
  });

  describe('formatDateLabel', () => {
    it('should return "Сегодня" for today in ru', () => {
      const today = new Date().toISOString();
      expect(formatDateLabel(today, 'ru', ru)).toBe('Сегодня');
    });

    it('should return "Today" for today in en', () => {
      const today = new Date().toISOString();
      expect(formatDateLabel(today, 'en', en)).toBe('Today');
    });

    it('should return localized today labels', () => {
      const today = new Date().toISOString();
      expect(formatDateLabel(today, 'es', es)).toBe('Hoy');
      expect(formatDateLabel(today, 'de', de)).toBe('Heute');
      expect(formatDateLabel(today, 'fr', fr)).toBe("Aujourd'hui");
      expect(formatDateLabel(today, 'pt', pt)).toBe('Hoje');
    });

    it('should return "Вчера" for yesterday in ru', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(formatDateLabel(yesterday.toISOString(), 'ru', ru)).toBe('Вчера');
    });

    it('should return "Yesterday" for yesterday in en', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(formatDateLabel(yesterday.toISOString(), 'en', en)).toBe('Yesterday');
    });

    it('should format date with month name for older dates in ru', () => {
      const date = new Date(2024, 0, 15); // Jan 15, 2024
      const result = formatDateLabel(date.toISOString(), 'ru', ru);
      expect(result).toContain('15');
      expect(result).toContain('января');
    });

    it('should format same-year dates with locale-specific order', () => {
      const date = new Date(new Date().getFullYear(), 0, 15); // Jan 15 of current year
      expect(formatDateLabel(date.toISOString(), 'en', en)).toBe('January 15');
      expect(formatDateLabel(date.toISOString(), 'de', de)).toBe('15. Januar');
      expect(formatDateLabel(date.toISOString(), 'es', es)).toBe('15 de enero');
      expect(formatDateLabel(date.toISOString(), 'fr', fr)).toBe('15 janvier');
      expect(formatDateLabel(date.toISOString(), 'pt', pt)).toBe('15 de janeiro');
    });

    it('should format cross-year dates with locale-specific order and year', () => {
      const date = new Date(2024, 0, 15); // Jan 15, 2024
      expect(formatDateLabel(date.toISOString(), 'de', de)).toBe('15. Januar 2024');
      expect(formatDateLabel(date.toISOString(), 'es', es)).toBe('15 de enero de 2024');
      expect(formatDateLabel(date.toISOString(), 'fr', fr)).toBe('15 janvier 2024');
      expect(formatDateLabel(date.toISOString(), 'pt', pt)).toBe('15 de janeiro de 2024');
    });
  });

  describe('formatTime', () => {
    it('should return HH:MM format', () => {
      const date = new Date(2024, 0, 15, 14, 30);
      expect(formatTime(date.toISOString())).toBe('14:30');
    });

    it('should pad single digits', () => {
      const date = new Date(2024, 0, 15, 9, 5);
      expect(formatTime(date.toISOString())).toBe('09:05');
    });
  });

  describe('formatScheduledAt', () => {
    it('should format date and time for ru', () => {
      const date = new Date(2024, 0, 15, 14, 30);
      const result = formatScheduledAt(date.toISOString(), 'ru');
      expect(result).toBe('15.01.2024 14:30');
    });

    it('should format date and time for en', () => {
      const date = new Date(2024, 0, 15, 14, 30);
      const result = formatScheduledAt(date.toISOString(), 'en');
      expect(result).toBe('01/15/2024 14:30');
    });

    it('should format numeric dates for new locales', () => {
      const date = new Date(2024, 0, 15, 14, 30);
      expect(formatScheduledAt(date.toISOString(), 'de')).toBe('15.01.2024 14:30');
      expect(formatScheduledAt(date.toISOString(), 'es')).toBe('15/01/2024 14:30');
      expect(formatScheduledAt(date.toISOString(), 'fr')).toBe('15/01/2024 14:30');
      expect(formatScheduledAt(date.toISOString(), 'pt')).toBe('15/01/2024 14:30');
    });
  });

  describe('formatRelativeDate', () => {
    it('should return "Сегодня" for today in ru', () => {
      const today = new Date().toISOString();
      expect(formatRelativeDate(today, 'ru', ru)).toBe('Сегодня');
    });

    it('should return "Завтра" for tomorrow in ru', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(formatRelativeDate(tomorrow.toISOString(), 'ru', ru)).toBe('Завтра');
    });

    it('should return localized tomorrow labels', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(formatRelativeDate(tomorrow.toISOString(), 'en', en)).toBe('Tomorrow');
      expect(formatRelativeDate(tomorrow.toISOString(), 'es', es)).toBe('Mañana');
      expect(formatRelativeDate(tomorrow.toISOString(), 'de', de)).toBe('Morgen');
      expect(formatRelativeDate(tomorrow.toISOString(), 'fr', fr)).toBe('Demain');
      expect(formatRelativeDate(tomorrow.toISOString(), 'pt', pt)).toBe('Amanhã');
    });
  });

  describe('formatScheduledWhen', () => {
    it('should format periodic via everyNMin', () => {
      expect(
        formatScheduledWhen(
          { type: 'periodic', scheduledAt: null, intervalMinutes: 15 },
          'en',
          en,
        ),
      ).toBe('every 15 min');
    });

    it('should format periodic via everyNMin in new locales', () => {
      expect(
        formatScheduledWhen(
          { type: 'periodic', scheduledAt: null, intervalMinutes: 15 },
          'es',
          es,
        ),
      ).toBe('cada 15 min');
      expect(
        formatScheduledWhen(
          { type: 'periodic', scheduledAt: null, intervalMinutes: 15 },
          'de',
          de,
        ),
      ).toBe('alle 15 Min.');
    });

    it('should format today reminder as 24h time only', () => {
      const now = new Date();
      now.setHours(17, 55, 0, 0);
      const result = formatScheduledWhen(
        { type: 'reminder', scheduledAt: now.toISOString(), intervalMinutes: null },
        'en',
        en,
      );
      expect(result).toBe('17:55');
      expect(result).not.toMatch(/AM|PM/i);
    });

    it('should format tomorrow reminder with 24h time', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(22, 0, 0, 0);
      const result = formatScheduledWhen(
        { type: 'reminder', scheduledAt: tomorrow.toISOString(), intervalMinutes: null },
        'en',
        en,
      );
      expect(result).toBe(`${en.tomorrow} 22:00`);
      expect(result).not.toMatch(/AM|PM/i);
    });

    it('should format tomorrow reminder in German', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(22, 0, 0, 0);
      const result = formatScheduledWhen(
        { type: 'reminder', scheduledAt: tomorrow.toISOString(), intervalMinutes: null },
        'de',
        de,
      );
      expect(result).toBe('Morgen 22:00');
    });
  });

  describe('formatInterval', () => {
    it('should format minutes only', () => {
      expect(formatInterval(5, ru)).toBe('5 мин');
      expect(formatInterval(5, en)).toBe('5 min');
      expect(formatInterval(5, es)).toBe('5 min');
      expect(formatInterval(5, de)).toBe('5 Min.');
    });

    it('should format hours and minutes', () => {
      expect(formatInterval(90, ru)).toBe('1 ч 30 мин');
      expect(formatInterval(90, en)).toBe('1 h 30 min');
      expect(formatInterval(90, es)).toBe('1 h 30 min');
    });

    it('should format hours only when no remaining minutes', () => {
      expect(formatInterval(120, ru)).toBe('2 ч');
      expect(formatInterval(120, en)).toBe('2 h');
    });

    it('should format days', () => {
      expect(formatInterval(1440, ru)).toBe('1 дн');
      expect(formatInterval(1440, en)).toBe('1 d');
      expect(formatInterval(1440, fr)).toBe('1 j');
    });
  });

  describe('formatShortMonth', () => {
    it('should return Russian short month for ru', () => {
      const jan = new Date(2024, 0, 1);
      expect(formatShortMonth(jan, 'ru')).toBe('Янв');
    });

    it('should return English short month for en', () => {
      const jan = new Date(2024, 0, 1);
      expect(formatShortMonth(jan, 'en')).toBe('Jan');
    });

    it('should return short month for new locales', () => {
      const jan = new Date(2024, 0, 1);
      expect(formatShortMonth(jan, 'es')).toBe('Ene');
      expect(formatShortMonth(jan, 'de')).toBe('Jan');
      expect(formatShortMonth(jan, 'fr')).toBe('Janv');
      expect(formatShortMonth(jan, 'pt')).toBe('Jan');
    });
  });
});
