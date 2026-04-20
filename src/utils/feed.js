import { supabase } from './supabase';
import { cheer, uncheer, hascheered } from './community';

// ─── Post to feed ──────────────────────────────────────────────────────────
export async function postActivity({ userId, displayName, area, eventType, metadata, fitnessLevel }) {
  const { data, error } = await supabase.from('activity_feed').insert({
    user_id: userId,
    display_name: displayName,   // "Jake W"
    area,                         // "SE1" or "London"
    event_type: eventType,        // 'run_complete' | 'workout_complete' | 'routine_shared'
    metadata,                     // { week: 3, session: 2, duration: '28:00' }
    fitness_level: fitnessLevel,
  }).select().single();
  if (error) throw error;
  return data;
}

// ─── Fetch feed ────────────────────────────────────────────────────────────
export async function fetchFeed({ area, fitnessLevel, limit = 30 } = {}) {
  let query = supabase
    .from('activity_feed')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  // Filter by area if provided (loose match)
  if (area) {
    query = query.ilike('area', `%${area.split(' ')[0]}%`);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// ─── Format feed events ────────────────────────────────────────────────────
export function formatFeedEvent(event) {
  const { display_name, event_type, metadata, area, created_at } = event;
  const ago = timeAgo(created_at);
  const location = area ? ` in ${area}` : '';

  switch (event_type) {
    case 'run_complete':
      return {
        text: `${display_name}${location} just completed Run Week ${metadata.week}, Session ${metadata.session}`,
        sub: metadata.duration ? `${metadata.duration} · ${ago}` : ago,
        emoji: '🏃',
        color: '#3b82f6',
      };
    case 'workout_complete':
      return {
        text: `${display_name}${location} just finished ${metadata.workout_name || 'a workout'}`,
        sub: metadata.duration ? `${metadata.duration} · ${ago}` : ago,
        emoji: '💪',
        color: '#10b981',
      };
    case 'run_streak':
      return {
        text: `${display_name}${location} hit a ${metadata.streak}-run streak 🔥`,
        sub: ago,
        emoji: '🔥',
        color: '#f97316',
      };
    case 'routine_shared':
      return {
        text: `${display_name} shared a new public routine: "${metadata.name}"`,
        sub: `${metadata.fitness_level || 'all levels'} · ${ago}`,
        emoji: '📋',
        color: '#a78bfa',
      };
    case 'weight_milestone':
      return {
        text: `${display_name}${location} hit a weight milestone`,
        sub: ago,
        emoji: '⚖️',
        color: '#4ade80',
      };
    default:
      return { text: `${display_name} did something great`, sub: ago, emoji: '⭐', color: '#facc15' };
  }
}

// ─── Cheer feed item ───────────────────────────────────────────────────────
export { cheer, uncheer, hascheered };

// ─── Push tokens ──────────────────────────────────────────────────────────
export async function savePushToken(userId, token) {
  await supabase.from('push_tokens').upsert({
    user_id: userId,
    token,
    updated_at: new Date().toISOString(),
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────
export function makeDisplayName(email) {
  // "jake.watson@gmail.com" → "Jake W"
  const local = email.split('@')[0];
  const parts = local.replace(/[._-]/g, ' ').split(' ').filter(Boolean);
  if (parts.length >= 2) return `${cap(parts[0])} ${cap(parts[1][0])}.`;
  return cap(parts[0] || 'User');
}

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(); }

function timeAgo(ts) {
  const diff = (Date.now() - new Date(ts).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
