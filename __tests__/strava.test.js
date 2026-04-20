// Strava utility tests — mocks fetch and AsyncStorage
const AsyncStorage = require('@react-native-async-storage/async-storage');

// Mock expo-web-browser and expo-auth-session (already in moduleNameMapper)
import { isStravaConnected, fetchRecentStravaRuns } from '../src/utils/strava';

global.fetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  AsyncStorage.clear?.();
});

describe('isStravaConnected', () => {
  test('returns false when no tokens stored', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(null);
    expect(await isStravaConnected()).toBe(false);
  });

  test('returns true when valid tokens exist', async () => {
    const tokens = { access_token: 'abc', refresh_token: 'def', expires_at: Date.now()/1000 + 3600 };
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(tokens));
    expect(await isStravaConnected()).toBe(true);
  });

  test('returns false on storage error', async () => {
    AsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage error'));
    expect(await isStravaConnected()).toBe(false);
  });
});

describe('fetchRecentStravaRuns', () => {
  test('returns empty array when not connected', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(null);
    const result = await fetchRecentStravaRuns();
    expect(result).toEqual([]);
  });

  test('returns activities when connected', async () => {
    const tokens = { access_token: 'valid-token', refresh_token: 'ref', expires_at: Date.now()/1000 + 3600 };
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(tokens));
    const mockActivities = [
      { id: 1, name: 'Morning Run', distance: 5000, elapsed_time: 1800 },
      { id: 2, name: 'Evening Run', distance: 3000, elapsed_time: 1200 },
    ];
    fetch.mockResolvedValueOnce({ json: () => Promise.resolve(mockActivities) });
    const result = await fetchRecentStravaRuns(5);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Morning Run');
  });

  test('returns empty array on fetch error', async () => {
    const tokens = { access_token: 'valid-token', refresh_token: 'ref', expires_at: Date.now()/1000 + 3600 };
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(tokens));
    fetch.mockRejectedValueOnce(new Error('Network error'));
    const result = await fetchRecentStravaRuns();
    expect(result).toEqual([]);
  });

  test('returns empty array when API returns non-array', async () => {
    const tokens = { access_token: 'valid-token', refresh_token: 'ref', expires_at: Date.now()/1000 + 3600 };
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(tokens));
    fetch.mockResolvedValueOnce({ json: () => Promise.resolve({ message: 'Authorization Error' }) });
    const result = await fetchRecentStravaRuns();
    expect(result).toEqual([]);
  });
});

describe('postRunToStrava', () => {
  // Test the function exists and handles missing tokens gracefully
  test('returns false when not connected', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(null);
    const { postRunToStrava } = require('../src/utils/strava');
    const result = await postRunToStrava({ name: 'Test Run', durationSecs: 1800 });
    expect(result).toBe(false);
  });

  test('returns true on successful post', async () => {
    const tokens = { access_token: 'valid-token', refresh_token: 'ref', expires_at: Date.now()/1000 + 3600 };
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(tokens));
    fetch.mockResolvedValueOnce({ ok: true });
    const { postRunToStrava } = require('../src/utils/strava');
    const result = await postRunToStrava({ name: 'Morning Run', durationSecs: 1800, distanceMeters: 5000 });
    expect(result).toBe(true);
  });
});
