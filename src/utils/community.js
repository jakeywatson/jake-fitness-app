import { supabase } from './supabase';

// ─── Workouts ──────────────────────────────────────────────────────────────
export async function saveWorkout(workout) {
  const { data, error } = await supabase
    .from('workouts')
    .upsert(workout, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchPublicWorkouts({ limit = 20, orderBy = 'play_count' } = {}) {
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('is_public', true)
    .order(orderBy, { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function fetchMyWorkouts(userId) {
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('creator_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function deleteWorkout(workoutId) {
  const { error } = await supabase.from('workouts').delete().eq('id', workoutId);
  if (error) throw error;
}

export async function incrementPlayCount(workoutId) {
  await supabase.rpc('increment_play_count', { workout_id: workoutId }).catch(() => {
    // Fallback: just update directly
    supabase.from('workouts')
      .update({ play_count: supabase.raw('play_count + 1') })
      .eq('id', workoutId);
  });
}

// ─── Cheers ────────────────────────────────────────────────────────────────
export async function cheer({ fromUserId, targetType, targetId }) {
  const { error } = await supabase.from('claps').insert({
    from_user_id: fromUserId,
    target_type: targetType,
    target_id: targetId,
  });
  if (error && error.code !== '23505') throw error; // ignore duplicate
  // Update clap_count on parent
  const table = targetType === 'workout' ? 'workouts' : 'activity_feed';
  await supabase.from(table).update({ clap_count: supabase.raw?.('clap_count + 1') })
    .eq('id', targetId).catch(() => {});
  return !error;
}

export async function uncheer({ fromUserId, targetId }) {
  await supabase.from('claps')
    .delete()
    .eq('from_user_id', fromUserId)
    .eq('target_id', targetId);
}

export async function hascheered({ fromUserId, targetId }) {
  const { data } = await supabase.from('claps')
    .select('id')
    .eq('from_user_id', fromUserId)
    .eq('target_id', targetId)
    .maybeSingle();
  return !!data;
}

export async function fetchCheerCounts(targetIds) {
  if (!targetIds.length) return {};
  const { data } = await supabase.from('claps')
    .select('target_id')
    .in('target_id', targetIds);
  const counts = {};
  (data || []).forEach(r => {
    counts[r.target_id] = (counts[r.target_id] || 0) + 1;
  });
  return counts;
}

// ─── Leaderboard ───────────────────────────────────────────────────────────
export async function fetchLeaderboard({ fitnessLevel, metric = 'play_count', limit = 10 } = {}) {
  let query = supabase
    .from('workouts')
    .select('id, name, display_name, play_count, clap_count, fitness_level, moves')
    .eq('is_public', true);
  if (fitnessLevel && fitnessLevel !== 'any') {
    query = query.in('fitness_level', [fitnessLevel, 'any']);
  }
  const { data, error } = await query
    .order(metric, { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}
