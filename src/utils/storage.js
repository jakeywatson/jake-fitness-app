import { SUPABASE_URL, SUPABASE_ANON_KEY, USER_ID } from '../constants/data';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HEADERS = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'resolution=merge-duplicates',
};

export async function loadData() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/fitness_data?id=eq.${USER_ID}&select=data`, { headers: HEADERS });
    const rows = await res.json();
    if (rows && rows[0]) return rows[0].data;
  } catch (e) {}
  // fallback to local
  try {
    const local = await AsyncStorage.getItem('jft_data');
    if (local) return JSON.parse(local);
  } catch (e) {}
  return null;
}

export async function saveData(data) {
  try {
    await AsyncStorage.setItem('jft_data', JSON.stringify(data));
  } catch (e) {}
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/fitness_data`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({ id: USER_ID, data, updated_at: new Date().toISOString() }),
    });
  } catch (e) {}
}
