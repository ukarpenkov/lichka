module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['./jest.setup.js'],
  moduleNameMapper: {
    '[\\\\/]shared[\\\\/]ui[\\\\/]pixel$': '<rootDir>/__mocks__/pixelIcons.js',
  },
};
