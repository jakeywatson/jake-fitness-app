import { loadUserData, saveUserData } from '../src/utils/supabase';

// supabase-js is mocked via __mocks__/@supabase/supabase-js.js
const { mockClient } = require('@supabase/supabase-js');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('loadUserData', () => {
  test('returns data when Supabase returns a row', async () => {
    const mockData = { week: 3, weights: [{ date: '2026-01-01', lbs: 240 }] };
    mockClient.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { data: mockData }, error: null }),
    });
    const result = await loadUserData('user-123');
    expect(result).toEqual(mockData);
  });

  test('returns null when Supabase returns no row', async () => {
    mockClient.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
    });
    const result = await loadUserData('user-123');
    expect(result).toBeNull();
  });

  test('falls back to AsyncStorage when Supabase throws', async () => {
    mockClient.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockRejectedValue(new Error('Network error')),
    });
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify({ week: 2 }));
    const result = await loadUserData('user-123');
    expect(result).toEqual({ week: 2 });
  });

  test('returns null when both fail', async () => {
    mockClient.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockRejectedValue(new Error('fail')),
    });
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    AsyncStorage.getItem.mockResolvedValueOnce(null);
    const result = await loadUserData('user-123');
    expect(result).toBeNull();
  });
});

describe('saveUserData', () => {
  test('saves to AsyncStorage with user-scoped key', async () => {
    mockClient.from.mockReturnValue({
      upsert: jest.fn().mockResolvedValue({ data: null, error: null }),
    });
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    const data = { week: 5, weights: [] };
    await saveUserData('user-123', data);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('jft_user-123', JSON.stringify(data));
  });

  test('calls Supabase upsert with userId as id', async () => {
    const upsertMock = jest.fn().mockResolvedValue({ data: null, error: null });
    mockClient.from.mockReturnValue({ upsert: upsertMock });
    const data = { week: 2 };
    await saveUserData('user-abc', data);
    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'user-abc', data })
    );
  });

  test('does not throw if Supabase fails', async () => {
    mockClient.from.mockReturnValue({
      upsert: jest.fn().mockRejectedValue(new Error('Offline')),
    });
    await expect(saveUserData('user-123', {})).resolves.not.toThrow();
  });
});
