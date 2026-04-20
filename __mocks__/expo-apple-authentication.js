module.exports = {
  signInAsync: jest.fn().mockResolvedValue({ identityToken: 'mock-token', fullName: { givenName: 'Jake' } }),
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  AppleAuthenticationScope: { FULL_NAME: 0, EMAIL: 1 },
  AppleAuthenticationCredentialState: { AUTHORIZED: 1 },
};
