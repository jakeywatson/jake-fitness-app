module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'node',
  setupFiles: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@ungap)',
  ],
  moduleNameMapper: {
    '^react-native-svg$': '<rootDir>/__mocks__/react-native-svg.js',
    '^expo-speech$': '<rootDir>/__mocks__/expo-speech.js',
    '^expo-keep-awake$': '<rootDir>/__mocks__/expo-keep-awake.js',
    '^expo-location$': '<rootDir>/__mocks__/expo-location.js',
    '^@react-native-async-storage/async-storage$': '<rootDir>/__mocks__/@react-native-async-storage/async-storage.js',
    '^expo/src/winter/(.*)$': '<rootDir>/__mocks__/expo-winter.js',
    '^expo/src/winter$': '<rootDir>/__mocks__/expo-winter.js',
  },
};
