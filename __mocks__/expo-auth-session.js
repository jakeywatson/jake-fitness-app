module.exports = {
  makeRedirectUri: jest.fn(() => 'zerotofit://auth/callback'),
  useAuthRequest: jest.fn(() => [null, null, jest.fn()]),
  AuthRequest: jest.fn(),
  ResponseType: { Code: 'code', Token: 'token' },
};
