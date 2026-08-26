import {
  dictionaries,
  SUPPORTED_LOCALES,
  getDictionary,
  getLocaleBundle,
  getSystemLocale,
  type Locale,
  type LocaleDictionary,
} from '../locale';

const EXPECTED_LOCALES: Locale[] = ['ru', 'en', 'es', 'de', 'fr', 'pt'];

describe('locale', () => {
  describe('dictionaries', () => {
    it('should have all supported locales in dictionaries', () => {
      for (const locale of SUPPORTED_LOCALES) {
        expect(dictionaries[locale]).toBeDefined();
      }
    });

    it('should have matching keys across all locales', () => {
      const enKeys = Object.keys(dictionaries.en).sort();
      for (const locale of EXPECTED_LOCALES) {
        const keys = Object.keys(dictionaries[locale]).sort();
        expect(keys).toEqual(enKeys);
      }
    });

    it('should have all required string keys in every locale', () => {
      const requiredKeys: (keyof LocaleDictionary)[] = [
        'cancel', 'save', 'done', 'error', 'loading', 'delete', 'edit', 'copy',
        'today', 'yesterday', 'tomorrow',
        'chats', 'deleteChat', 'createFirstChat',
        'shareChooseChat',
        'openLink',
        'linkOpenFailed',
        'scheduled', 'noScheduled', 'scheduledUntitled',
        'futureMode', 'futureEmptyTitle', 'futureScheduleCta',
        'futurePeekA11y', 'futureExitA11y',
        'settings', 'sectionTheme', 'sectionSound', 'sectionLanguage',
        'sectionBackup', 'sectionAbout',
        'sound', 'hapticFeedback', 'interfaceLanguage',
        'version',
      ];

      for (const locale of EXPECTED_LOCALES) {
        const dict = dictionaries[locale];
        for (const key of requiredKeys) {
          expect(typeof dict[key]).toBe('string');
          expect((dict[key] as string).length).toBeGreaterThan(0);
        }
      }
    });

    it('should have working template functions in every locale', () => {
      for (const locale of EXPECTED_LOCALES) {
        const dict = dictionaries[locale];

        expect(dict.deleteChatConfirm('Test')).toContain('Test');
        expect(dict.everyNMin(5)).toContain('5');
        expect(dict.voiceMessage(10)).toBe('[voice:10]');
        expect(dict.exportDone('/path')).toContain('/path');
        expect(dict.chatsAdded(3)).toContain('3');
        expect(dict.mediaRestored(7)).toContain('7');
      }
    });

    it('should have working image template functions in every locale', () => {
      for (const locale of EXPECTED_LOCALES) {
        const dict = dictionaries[locale];
        expect(dict.imageMessage(1920, 1080)).toBe('[image:1920x1080]');
      }
    });

    it('should have all image-related keys as strings in every locale', () => {
      const imageStringKeys = ['attachImage', 'imagePreview', 'removeImage', 'imagePickError'] as const;

      for (const locale of EXPECTED_LOCALES) {
        const dict = dictionaries[locale];
        for (const key of imageStringKeys) {
          expect(typeof dict[key]).toBe('string');
          expect((dict[key] as string).length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('bundles', () => {
    it('should provide 12 full and short month names per locale', () => {
      for (const locale of EXPECTED_LOCALES) {
        const bundle = getLocaleBundle(locale);
        expect(bundle.monthsFull).toHaveLength(12);
        expect(bundle.monthsShort).toHaveLength(12);
        expect(bundle.date.localeTag).toBeTruthy();
      }
    });

    it('should provide 7 non-empty weekday abbreviations per locale', () => {
      for (const locale of EXPECTED_LOCALES) {
        const { weekdaysShort } = getLocaleBundle(locale);
        expect(weekdaysShort).toHaveLength(7);
        for (const label of weekdaysShort) {
          expect(label.length).toBeGreaterThan(0);
        }
      }
    });

    it('should provide a non-empty native language name per locale', () => {
      for (const locale of EXPECTED_LOCALES) {
        const bundle = getLocaleBundle(locale);
        expect(typeof bundle.nativeName).toBe('string');
        expect(bundle.nativeName.length).toBeGreaterThan(0);
      }
    });
  });

  describe('SUPPORTED_LOCALES', () => {
    it('should contain all expected locales', () => {
      for (const locale of EXPECTED_LOCALES) {
        expect(SUPPORTED_LOCALES).toContain(locale);
      }
    });

    it('should have exactly 6 locales', () => {
      expect(SUPPORTED_LOCALES).toHaveLength(6);
    });
  });

  describe('getDictionary', () => {
    it('should return the matching dictionary for each locale', () => {
      for (const locale of EXPECTED_LOCALES) {
        expect(getDictionary(locale)).toBe(dictionaries[locale]);
      }
    });

    it('should fallback to en for unknown locale', () => {
      expect(getDictionary('xx')).toBe(dictionaries.en);
    });

    it('should fallback to en for empty string', () => {
      expect(getDictionary('')).toBe(dictionaries.en);
    });
  });

  describe('getSystemLocale', () => {
    it('should return a valid locale', () => {
      const locale = getSystemLocale();
      expect(SUPPORTED_LOCALES).toContain(locale);
    });
  });
});
