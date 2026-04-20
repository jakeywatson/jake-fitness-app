module.exports = {
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  requestPermissionsAsync: jest.fn().mockResolvedValue([]),
  insertRecordsAsync: jest.fn().mockResolvedValue([]),
  readRecordsAsync: jest.fn().mockResolvedValue({ records: [] }),
};
