import {
  getMonthLabels,
  getFullMonthNames,
  formatDateLabel,
  formatTime,
  formatScheduledAt,
  formatRelativeDate,
  formatInterval,
  formatShortMonth,
} from '../dateUtils';
import { ru, en } from '../locale';

describe('dateUtils', () => {
  describe('getMonthLabels', () => {
    it('should return 12 labels for ru', () => {
      expect(getMonthLabels('ru')).toHaveLength(12);
    });

    it('should return 12 labels for en', () => {
      expect(getMonthLabels('en')).toHaveLength(12);
    });

    it('should return Russian short months for ru', () => {
      const labels = getMonthLabels('ru');
      expect(labels[0]).toBe('Янв');
      expect(labels[11]).toBe('Дек');
    });

    it('should return English short months for en', () => {
      const labels = getMonthLabels('en');
      expect(labels[0]).toBe('Jan');
      expect(labels[11]).toBe('Dec');
    });
  });

  describe('getFullMonthNames', () => {
    it('should return 12 names for ru', () => {
      expect(getFullMonthNames('ru')).toHaveLength(12);
    });

    it('should return 12 names for en', () => {
      expect(getFullMonthNames('en')).toHaveLength(12);
    });

    it('should return Russian genitive months for ru', () => {
      const names = getFullMonthNames('ru');
      expect(names[0]).toBe('января');
      expect(names[4]).toBe('мая');
    });

    it('should return English months for en', () => {
      const names = getFullMonthNames('en');
      expect(names[0]).toBe('January');
      expect(names[4]).toBe('May');
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

    it('should format date with month name for older dates', () => {
      const date = new Date(2024, 0, 15); // Jan 15, 2024
      const result = formatDateLabel(date.toISOString(), 'ru', ru);
      expect(result).toContain('15');
      expect(result).toContain('января');
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
      expect(result).toContain('15');
      expect(result).toContain('01');
      expect(result).toContain('2024');
      expect(result).toContain('14:30');
    });

    it('should format date and time for en', () => {
      const date = new Date(2024, 0, 15, 14, 30);
      const result = formatScheduledAt(date.toISOString(), 'en');
      expect(result).toContain('14:30');
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

    it('should return "Tomorrow" for tomorrow in en', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(formatRelativeDate(tomorrow.toISOString(), 'en', en)).toBe('Tomorrow');
    });
  });

  describe('formatInterval', () => {
    it('should format minutes only', () => {
      expect(formatInterval(5, ru)).toBe('5 мин');
      expect(formatInterval(5, en)).toBe('5 min');
    });

    it('should format hours and minutes', () => {
      expect(formatInterval(90, ru)).toBe('1 ч 30 мин');
      expect(formatInterval(90, en)).toBe('1 h 30 min');
    });

    it('should format hours only when no remaining minutes', () => {
      expect(formatInterval(120, ru)).toBe('2 ч');
      expect(formatInterval(120, en)).toBe('2 h');
    });

    it('should format days', () => {
      expect(formatInterval(1440, ru)).toBe('1 дн');
      expect(formatInterval(1440, en)).toBe('1 d');
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
  });
});
