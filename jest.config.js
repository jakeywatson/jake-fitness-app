module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'node',
  setupFiles: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@ungap|@supabase)',
  ],
  moduleNameMapper: {
    '^react-native-svg$': '<rootDir>/__mocks__/react-native-svg.js',
    '^expo-speech$': '<rootDir>/__mocks__/expo-speech.js',
    '^expo-keep-awake$': '<rootDir>/__mocks__/expo-keep-awake.js',
    '^expo-location$': '<rootDir>/__mocks__/expo-location.js',
    '^@react-native-async-storage/async-storage$': '<rootDir>/__mocks__/@react-native-async-storage/async-storage.js',
    '^expo/src/winter/(.*)$': '<rootDir>/__mocks__/expo-winter.js',
    '^expo/src/winter$': '<rootDir>/__mocks__/expo-winter.js',
    '^react-native-worklets/plugin$': '<rootDir>/__mocks__/react-native-worklets/plugin.js',
    '^react-native-reanimated$': '<rootDir>/__mocks__/react-native-reanimated.js',
    '^react-native-purchases$': '<rootDir>/__mocks__/react-native-purchases.js',
    '^expo-secure-store$': '<rootDir>/__mocks__/expo-secure-store.js',
    '^@supabase/supabase-js$': '<rootDir>/__mocks__/@supabase/supabase-js.js',
  },
};
