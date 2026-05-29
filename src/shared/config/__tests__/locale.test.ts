import {
  ru,
  en,
  dictionaries,
  SUPPORTED_LOCALES,
  getDictionary,
  getSystemLocale,
  type LocaleDictionary,
} from '../locale';

describe('locale', () => {
  describe('dictionaries', () => {
    it('should have ru and en dictionaries', () => {
      expect(dictionaries.ru).toBeDefined();
      expect(dictionaries.en).toBeDefined();
    });

    it('should have all supported locales in dictionaries', () => {
      for (const locale of SUPPORTED_LOCALES) {
        expect(dictionaries[locale]).toBeDefined();
      }
    });

    it('should have matching keys in ru and en', () => {
      const ruKeys = Object.keys(ru).sort();
      const enKeys = Object.keys(en).sort();
      expect(ruKeys).toEqual(enKeys);
    });

    it('should have all required string keys', () => {
      const requiredKeys: (keyof LocaleDictionary)[] = [
        'cancel', 'save', 'done', 'error', 'loading', 'delete', 'edit',
        'today', 'yesterday', 'tomorrow',
        'chats', 'deleteChat', 'createFirstChat',
        'settings', 'sectionTheme', 'sectionSound', 'sectionLanguage',
        'sectionBackup', 'sectionAbout',
        'sound', 'hapticFeedback', 'interfaceLanguage',
        'version',
      ];

      for (const key of requiredKeys) {
        expect(typeof ru[key]).toBe('string');
        expect((ru[key] as string).length).toBeGreaterThan(0);
        expect(typeof en[key]).toBe('string');
        expect((en[key] as string).length).toBeGreaterThan(0);
      }
    });

    it('should have working template functions', () => {
      expect(ru.deleteChatConfirm('Test')).toContain('Test');
      expect(en.deleteChatConfirm('Test')).toContain('Test');

      expect(ru.everyNMin(5)).toContain('5');
      expect(en.everyNMin(5)).toContain('5');

      expect(ru.voiceMessage(10)).toBe('[voice:10]');
      expect(en.voiceMessage(10)).toBe('[voice:10]');

      expect(ru.exportDone('/path')).toContain('/path');
      expect(en.exportDone('/path')).toContain('/path');

      expect(ru.chatsAdded(3)).toContain('3');
      expect(en.chatsAdded(3)).toContain('3');
    });
  });

  describe('SUPPORTED_LOCALES', () => {
    it('should contain ru and en', () => {
      expect(SUPPORTED_LOCALES).toContain('ru');
      expect(SUPPORTED_LOCALES).toContain('en');
    });

    it('should have exactly 2 locales', () => {
      expect(SUPPORTED_LOCALES).toHaveLength(2);
    });
  });

  describe('getDictionary', () => {
    it('should return ru dictionary for "ru"', () => {
      expect(getDictionary('ru')).toBe(ru);
    });

    it('should return en dictionary for "en"', () => {
      expect(getDictionary('en')).toBe(en);
    });

    it('should fallback to en for unknown locale', () => {
      expect(getDictionary('fr')).toBe(en);
    });

    it('should fallback to en for empty string', () => {
      expect(getDictionary('')).toBe(en);
    });
  });

  describe('getSystemLocale', () => {
    it('should return a valid locale', () => {
      const locale = getSystemLocale();
      expect(SUPPORTED_LOCALES).toContain(locale);
    });
  });
});
