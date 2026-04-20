module.exports = {
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  watchPositionAsync: jest.fn().mockResolvedValue({ remove: jest.fn() }),
  Accuracy: { High: 6 },
};
