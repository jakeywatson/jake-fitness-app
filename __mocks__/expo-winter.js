// Mock for expo's winter runtime - uses import.meta which Jest doesn't support
module.exports = {
  ImportMetaRegistry: { url: 'http://localhost' },
  installGlobal: () => {},
};
