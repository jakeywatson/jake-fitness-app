import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { COLORS } from '../constants/data';
import { fetchPublicWorkouts, fetchLeaderboard, cheer, uncheer, hascheered } from '../utils/community';
import WorkoutBuilderScreen from './WorkoutBuilderScreen';
import UpgradePrompt from '../components/UpgradePrompt';

const TABS = ['trending', 'newest', 'leaderboard'];

export default function CommunityScreen({ user, isPremium, onUpgrade, onPlayWorkout }) {
  const [tab, setTab] = useState('trending');
  const [workouts, setWorkouts] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cheered, setCheered] = useState({});
  const [showBuilder, setShowBuilder] = useState(false);

  const load = useCallback(async () => {
    try {
      if (tab === 'leaderboard') {
        const data = await fetchLeaderboard({ limit: 20 });
        setLeaderboard(data);
      } else {
        const orderBy = tab === 'trending' ? 'clap_count' : 'created_at';
        const data = await fetchPublicWorkouts({ orderBy, limit: 30 });
        setWorkouts(data);
        // Check which ones current user has cheered
        if (user && data.length) {
          const checks = await Promise.all(
            data.map(w => hascheered({ fromUserId: user.id, targetId: w.id }))
          );
          const map = {};
          data.forEach((w, i) => { map[w.id] = checks[i]; });
          setCheered(map);
        }
      }
    } catch (e) {
      console.log('Community load error:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tab, user]);

  useEffect(() => { setLoading(true); load(); }, [tab]);

  const handleCheer = async (workoutId) => {
    if (!user) return;
    const already = cheered[workoutId];
    setCheered(prev => ({ ...prev, [workoutId]: !already }));
    setWorkouts(prev => prev.map(w => w.id === workoutId
      ? { ...w, clap_count: w.clap_count + (already ? -1 : 1) }
      : w
    ));
    if (already) {
      await uncheer({ fromUserId: user.id, targetId: workoutId });
    } else {
      await cheer({ fromUserId: user.id, targetType: 'workout', targetId: workoutId });
    }
  };

  if (showBuilder) {
    return (
      <WorkoutBuilderScreen
        user={user}
        isPremium={isPremium}
        onCancel={() => setShowBuilder(false)}
        onSaved={(workout) => {
          setShowBuilder(false);
          setTab('newest');
          load();
        }}
      />
    );
  }

  const displayWorkouts = tab === 'leaderboard' ? leaderboard : workouts;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>Community</Text>
          <Text style={styles.pageSub}>Workouts made by people like you</Text>
        </View>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => isPremium ? setShowBuilder(true) : onUpgrade()}
        >
          <Text style={styles.createBtnText}>+ Create</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'trending' ? '🔥 Trending' : t === 'newest' ? '✨ Newest' : '🏆 Top'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.blue} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.muted} />}
        >
          {!isPremium && (
            <UpgradePrompt
              message="Create and share your own workouts with the community. Premium feature."
              onUpgrade={onUpgrade}
            />
          )}

          {displayWorkouts.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🏋️</Text>
              <Text style={styles.emptyText}>No workouts yet</Text>
              <Text style={styles.emptySub}>Be the first to share one!</Text>
            </View>
          )}

          {displayWorkouts.map((workout, idx) => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              rank={tab === 'leaderboard' ? idx + 1 : null}
              cheered={!!cheered[workout.id]}
              onCheer={() => handleCheer(workout.id)}
              onPlay={() => onPlayWorkout(workout)}
              isOwn={user && workout.creator_id === user.id}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function WorkoutCard({ workout, rank, cheered, onCheer, onPlay, isOwn }) {
  const moveCount = workout.moves?.length || 0;
  const totalMins = workout.work_secs && workout.rest_secs
    ? Math.round((workout.work_secs + workout.rest_secs) * moveCount * (workout.rounds || 3) / 60)
    : null;

  return (
    <View style={styles.card}>
      {rank && (
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>#{rank}</Text>
        </View>
      )}
      <View style={styles.cardTop}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{workout.name}</Text>
          <Text style={styles.cardCreator}>by {workout.display_name}{isOwn ? ' (you)' : ''}</Text>
          {workout.description ? <Text style={styles.cardDesc} numberOfLines={2}>{workout.description}</Text> : null}
        </View>
        {workout.fitness_level !== 'any' && (
          <View style={[styles.levelBadge, workout.fitness_level === 'intermediate' && styles.levelBadgeInter]}>
            <Text style={styles.levelBadgeText}>{workout.fitness_level}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardMeta}>
        <Text style={styles.metaText}>{moveCount} exercises</Text>
        {totalMins && <Text style={styles.metaDot}>·</Text>}
        {totalMins && <Text style={styles.metaText}>~{totalMins} min</Text>}
        <Text style={styles.metaDot}>·</Text>
        <Text style={styles.metaText}>{workout.play_count} plays</Text>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.cheerBtn, cheered && styles.cheerBtnActive]}
          onPress={onCheer}
        >
          <Text style={styles.cheerBtnText}>{cheered ? '👏' : '👏'}</Text>
          <Text style={[styles.cheerCount, cheered && styles.cheerCountActive]}>
            {workout.clap_count || 0}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.playBtn} onPress={onPlay}>
          <Text style={styles.playBtnText}>▶  Try it</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 16, paddingTop: 52 },
  pageTitle: { fontSize: 28, fontWeight: '700', color: COLORS.text },
  pageSub: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  createBtn: { backgroundColor: COLORS.blue, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  createBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingHorizontal: 16 },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive: { borderBottomColor: COLORS.blue },
  tabText: { fontSize: 13, color: COLORS.muted },
  tabTextActive: { color: COLORS.blueLight, fontWeight: '700' },
  list: { padding: 16, gap: 12, paddingBottom: 40 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  emptySub: { fontSize: 14, color: COLORS.muted },
  card: { backgroundColor: '#0f1520', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  rankBadge: { backgroundColor: COLORS.blueDark, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 8 },
  rankText: { fontSize: 11, fontWeight: '700', color: COLORS.blueLight, letterSpacing: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 3 },
  cardCreator: { fontSize: 12, color: COLORS.muted },
  cardDesc: { fontSize: 13, color: COLORS.dim, marginTop: 4, lineHeight: 18 },
  levelBadge: { backgroundColor: COLORS.greenBg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: COLORS.greenDark },
  levelBadgeInter: { backgroundColor: '#1a1500', borderColor: '#854d0e' },
  levelBadgeText: { fontSize: 10, color: COLORS.green, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  metaText: { fontSize: 12, color: COLORS.muted },
  metaDot: { color: COLORS.muted, fontSize: 12 },
  cardActions: { flexDirection: 'row', gap: 10 },
  cheerBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#1e2d42', backgroundColor: COLORS.bg },
  cheerBtnActive: { borderColor: COLORS.yellow, backgroundColor: '#1a1500' },
  cheerBtnText: { fontSize: 16 },
  cheerCount: { fontSize: 13, color: COLORS.muted, fontWeight: '600' },
  cheerCountActive: { color: COLORS.yellow },
  playBtn: { flex: 1, backgroundColor: COLORS.blueDark, borderRadius: 10, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.blue },
  playBtnText: { color: COLORS.blueLight, fontSize: 14, fontWeight: '700' },
});
