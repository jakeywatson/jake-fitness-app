import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REDIRECT_URI } from '../constants/config';

const STRAVA_AUTH_URL = 'https://www.strava.com/oauth/mobile/authorize';
const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token';
const STRAVA_API = 'https://www.strava.com/api/v3';
const STORAGE_KEY = 'strava_tokens';

WebBrowser.maybeCompleteAuthSession();

export async function connectStrava() {
  const redirectUri = AuthSession.makeRedirectUri({ scheme: 'zerotofit', path: 'strava-auth' });
  const authUrl = `${STRAVA_AUTH_URL}?client_id=${STRAVA_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&approval_prompt=auto&scope=activity:write,activity:read_all`;
  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

  if (result.type !== 'success') return null;
  const code = new URL(result.url).searchParams.get('code');
  if (!code) return null;

  // Exchange code for tokens
  const tokenRes = await fetch(STRAVA_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    }),
  });
  const tokens = await tokenRes.json();
  if (!tokens.access_token) return null;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  return tokens;
}

export async function disconnectStrava() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

export async function getStravaTokens() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const tokens = JSON.parse(raw);
    // Refresh if expired
    if (tokens.expires_at && tokens.expires_at < Date.now() / 1000) {
      return await refreshStravaToken(tokens.refresh_token);
    }
    return tokens;
  } catch { return null; }
}

async function refreshStravaToken(refreshToken) {
  const res = await fetch(STRAVA_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  const tokens = await res.json();
  if (tokens.access_token) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
    return tokens;
  }
  return null;
}

export async function isStravaConnected() {
  const tokens = await getStravaTokens();
  return !!tokens;
}

export async function postRunToStrava({ name, durationSecs, distanceMeters, startDateLocal, calories }) {
  const tokens = await getStravaTokens();
  if (!tokens) return false;
  try {
    const res = await fetch(`${STRAVA_API}/activities`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokens.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name || 'Run — Zero to Fit',
        type: 'Run',
        start_date_local: startDateLocal || new Date().toISOString(),
        elapsed_time: durationSecs,
        distance: distanceMeters || 0,
        description: 'Logged via Zero to Fit',
        calories,
      }),
    });
    return res.ok;
  } catch { return false; }
}

export async function fetchRecentStravaRuns(limit = 5) {
  const tokens = await getStravaTokens();
  if (!tokens) return [];
  try {
    const res = await fetch(`${STRAVA_API}/athlete/activities?per_page=${limit}&type=Run`, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}
