const mockSession = { user: { id: 'test-user-123', email: 'test@test.com' } };
const mockUser = { id: 'test-user-123', email: 'test@test.com' };

const mockAuth = {
  getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
  getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
  signInWithPassword: jest.fn().mockResolvedValue({ data: { user: mockUser, session: mockSession }, error: null }),
  signUp: jest.fn().mockResolvedValue({ data: { user: mockUser, session: null }, error: null }),
  signOut: jest.fn().mockResolvedValue({ error: null }),
  onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
};

const mockFrom = jest.fn(() => ({
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockResolvedValue({ data: { data: null }, error: null }),
  upsert: jest.fn().mockResolvedValue({ data: null, error: null }),
  insert: jest.fn().mockResolvedValue({ data: null, error: null }),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
}));

const mockClient = {
  auth: mockAuth,
  from: mockFrom,
};

module.exports = {
  createClient: jest.fn(() => mockClient),
  mockClient,
  mockAuth,
};
