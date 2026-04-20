module.exports = {
  openAuthSessionAsync: jest.fn().mockResolvedValue({ type: 'cancel' }),
  openBrowserAsync: jest.fn().mockResolvedValue({ type: 'cancel' }),
  maybeCompleteAuthSession: jest.fn(),
  WebBrowserResultType: { SUCCESS: 'success', CANCEL: 'cancel', DISMISS: 'dismiss' },
};
