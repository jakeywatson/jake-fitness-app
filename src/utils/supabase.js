import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../constants/config';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ─── Auth helpers ─────────────────────────────────────────────────────────────
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// ─── User data helpers (per-user, not hardcoded "jake") ───────────────────────
export async function loadUserData(userId) {
  try {
    const { data, error } = await supabase
      .from('fitness_data')
      .select('data')
      .eq('id', userId)
      .single();
    if (error || !data) return null;
    return data.data;
  } catch (e) {
    // Fallback to AsyncStorage
    try {
      const local = await AsyncStorage.getItem(`jft_${userId}`);
      return local ? JSON.parse(local) : null;
    } catch { return null; }
  }
}

export async function saveUserData(userId, data) {
  // Always save locally first (instant)
  try { await AsyncStorage.setItem(`jft_${userId}`, JSON.stringify(data)); } catch (e) {}
  // Then sync to Supabase
  try {
    await supabase.from('fitness_data').upsert({
      id: userId,
      data,
      updated_at: new Date().toISOString(),
    });
  } catch (e) {}
}

// ─── Social auth ──────────────────────────────────────────────────────────────
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

export async function signInWithGoogle() {
  const redirectUri = AuthSession.makeRedirectUri({ scheme: 'zerotofit', path: 'auth/callback' });
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUri,
      skipBrowserRedirect: true,
    },
  });
  if (error) throw error;

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);
  if (result.type !== 'success') return null;

  const url = new URL(result.url);
  const accessToken = url.searchParams.get('access_token');
  const refreshToken = url.searchParams.get('refresh_token');
  if (accessToken) {
    const { data: session, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (sessionError) throw sessionError;
    return session;
  }
  return null;
}

export async function signInWithApple() {
  let AppleAuthentication;
  try { AppleAuthentication = require('expo-apple-authentication'); } catch { return null; }
  try {
    const cred = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: cred.identityToken,
    });
    if (error) throw error;
    return data;
  } catch (e) {
    if (e.code !== 'ERR_REQUEST_CANCELED') throw e;
    return null;
  }
}
