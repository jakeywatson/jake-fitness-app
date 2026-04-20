/**
 * Tests for storage utility
 * Verifies save/load works correctly with mocked Supabase and AsyncStorage
 */
import { loadData, saveData } from '../src/utils/storage';

// Mock fetch globally
global.fetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('loadData', () => {
  test('returns data from Supabase when available', async () => {
    const mockData = { week: 3, weights: [{ date: '2026-01-01', lbs: 240 }] };
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve([{ data: mockData }])
    });
    const result = await loadData();
    expect(result).toEqual(mockData);
  });

  test('falls back to AsyncStorage when Supabase fails', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify({ week: 2 }));
    const result = await loadData();
    expect(result).toEqual({ week: 2 });
  });

  test('returns null when both Supabase and AsyncStorage are empty', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    AsyncStorage.getItem.mockResolvedValueOnce(null);
    const result = await loadData();
    expect(result).toBeNull();
  });

  test('returns null when Supabase returns empty array', async () => {
    fetch.mockResolvedValueOnce({ json: () => Promise.resolve([]) });
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    AsyncStorage.getItem.mockResolvedValueOnce(null);
    const result = await loadData();
    expect(result).toBeNull();
  });
});

describe('saveData', () => {
  test('saves to AsyncStorage immediately', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    const data = { week: 5, weights: [] };
    await saveData(data);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('jft_data', JSON.stringify(data));
  });

  test('calls Supabase with correct payload', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
    const data = { week: 2, checked: { 'w2_run_0': true } };
    await saveData(data);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('supabase.co'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"week":2'),
      })
    );
  });

  test('does not throw if Supabase fails', async () => {
    fetch.mockRejectedValueOnce(new Error('Offline'));
    const data = { week: 1 };
    await expect(saveData(data)).resolves.not.toThrow();
  });
});
