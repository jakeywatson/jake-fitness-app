module.exports = {
  default: { View: require('react-native').View, Text: require('react-native').Text },
  useSharedValue: jest.fn(() => ({ value: 0 })),
  useAnimatedStyle: jest.fn(() => ({})),
  withTiming: jest.fn(v => v),
  withSpring: jest.fn(v => v),
};
