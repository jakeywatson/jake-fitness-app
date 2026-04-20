module.exports = {
  digestStringAsync: jest.fn().mockResolvedValue('mock-hash'),
  CryptoDigestAlgorithm: { SHA256: 'SHA256' },
  randomUUID: jest.fn(() => 'mock-uuid-1234'),
};
