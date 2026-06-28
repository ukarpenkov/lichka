const reactNative = require('@react-native/eslint-config/flat');

module.exports = [
  ...reactNative.map((config) => {
    if (config.plugins?.['ft-flow']) {
      const { 'ft-flow': _, ...plugins } = config.plugins;
      const rules = config.rules
        ? Object.fromEntries(
            Object.entries(config.rules).filter(
              ([key]) => !key.startsWith('ft-flow/'),
            ),
          )
        : config.rules;
      return { ...config, plugins, rules };
    }
    return config;
  }),
  {
    ignores: ['node_modules/', 'android/', 'ios/', 'coverage/', 'scripts/'],
  },
  {
    files: ['**/__tests__/**', '**/*.test.*', '**/*.spec.*', 'jest.setup.js'],
    languageOptions: {
      globals: {
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        mock: 'readonly',
      },
    },
  },
];
