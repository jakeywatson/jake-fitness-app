import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, Switch,
} from 'react-native';
import { COLORS } from '../constants/data';
import { fetchFeed, formatFeedEvent, postActivity, cheer, uncheer, hascheered, makeDisplayName } from '../utils/feed';

export default function FeedScreen({ user, appState, onOptIn }) {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cheered, setCheered] = useState({});
  const { feedOptIn, area, fitnessLevel } = appState;

  const load = useCallback(async () => {
    try {
      const data = await fetchFeed({ area, fitnessLevel, limit: 40 });
      setFeed(data);
      if (user && data.length) {
        const checks = await Promise.all(
          data.map(e => hascheered({ fromUserId: user.id, targetId: e.id }))
        );
        const map = {};
        data.forEach((e, i) => { map[e.id] = checks[i]; });
        setCheered(map);
      }
    } catch (e) {
      console.log('Feed load error:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [area, fitnessLevel, user]);

  useEffect(() => { load(); }, []);

  const handleCheer = async (eventId, eventUserId) => {
    if (!user) return;
    const already = cheered[eventId];
    setCheered(prev => ({ ...prev, [eventId]: !already }));
    setFeed(prev => prev.map(e => e.id === eventId
      ? { ...e, clap_count: e.clap_count + (already ? -1 : 1) }
      : e
    ));
    if (already) {
      await uncheer({ fromUserId: user.id, targetId: eventId });
    } else {
      await cheer({ fromUserId: user.id, targetType: 'feed', targetId: eventId });
    }
  };

  if (!feedOptIn) {
    return (
      <View style={styles.optInContainer}>
        <Text style={styles.optInEmoji}>👋</Text>
        <Text style={styles.optInTitle}>Join the community</Text>
        <Text style={styles.optInText}>
          See what people nearby are up to. Share your completed workouts and runs — first name + last initial only, no precise location.
        </Text>
        <View style={styles.optInFeatures}>
          {[
            '👏 Cheer others on',
            '🏃 See local activity',
            '📋 Discover new routines',
            '🔒 First name + last initial only',
          ].map(f => (
            <View key={f} style={styles.optInFeatureRow}>
              <Text style={styles.optInFeatureText}>{f}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity style={styles.joinBtn} onPress={onOptIn}>
          <Text style={styles.joinBtnText}>Join the community →</Text>
        </TouchableOpacity>
        <Text style={styles.optInSmall}>You can leave at any time from your account settings.</Text>
      </View>
    );
  }

  const renderItem = ({ item: event }) => {
    const formatted = formatFeedEvent(event);
    const hasCheered = !!cheered[event.id];
    const isOwn = user && event.user_id === user.id;
    return (
      <View style={styles.feedItem}>
        <View style={[styles.feedIconBg, { backgroundColor: formatted.color + '22' }]}>
          <Text style={styles.feedIcon}>{formatted.emoji}</Text>
        </View>
        <View style={styles.feedContent}>
          <Text style={styles.feedText}>{formatted.text}</Text>
          <Text style={styles.feedSub}>{formatted.sub}</Text>
        </View>
        {!isOwn && (
          <TouchableOpacity
            style={[styles.cheerBtn, hasCheered && styles.cheerBtnActive]}
            onPress={() => handleCheer(event.id, event.user_id)}
          >
            <Text style={styles.cheerEmoji}>👏</Text>
            {event.clap_count > 0 && (
              <Text style={[styles.cheerCount, hasCheered && styles.cheerCountActive]}>
                {event.clap_count}
              </Text>
            )}
          </TouchableOpacity>
        )}
        {isOwn && event.clap_count > 0 && (
          <View style={styles.ownCheers}>
            <Text style={styles.cheerEmoji}>👏</Text>
            <Text style={styles.cheerCount}>{event.clap_count}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Feed</Text>
        <Text style={styles.pageSub}>Activity from people near you</Text>
      </View>
      {loading ? (
        <ActivityIndicator color={COLORS.blue} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={feed}
          keyExtractor={e => e.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(); }}
              tintColor={COLORS.muted}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🌍</Text>
              <Text style={styles.emptyTitle}>No activity yet</Text>
              <Text style={styles.emptySub}>Complete a workout or run to be the first!</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { padding: 16, paddingTop: 52, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  pageTitle: { fontSize: 28, fontWeight: '700', color: COLORS.text },
  pageSub: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  listContent: { padding: 16, paddingBottom: 40 },
  feedItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border, gap: 12 },
  feedIconBg: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  feedIcon: { fontSize: 22 },
  feedContent: { flex: 1 },
  feedText: { fontSize: 14, color: COLORS.text, lineHeight: 20 },
  feedSub: { fontSize: 12, color: COLORS.muted, marginTop: 3 },
  cheerBtn: { padding: 8, borderRadius: 10, backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', minWidth: 44 },
  cheerBtnActive: { borderColor: COLORS.yellow, backgroundColor: '#1a1500' },
  cheerEmoji: { fontSize: 18 },
  cheerCount: { fontSize: 11, color: COLORS.muted, fontWeight: '600', marginTop: 2 },
  cheerCountActive: { color: COLORS.yellow },
  ownCheers: { alignItems: 'center', minWidth: 44 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  emptySub: { fontSize: 14, color: COLORS.muted },
  optInContainer: { flex: 1, backgroundColor: COLORS.bg, padding: 24, paddingTop: 80, alignItems: 'center' },
  optInEmoji: { fontSize: 56, marginBottom: 16 },
  optInTitle: { fontSize: 26, fontWeight: '700', color: COLORS.text, marginBottom: 12, textAlign: 'center' },
  optInText: { fontSize: 15, color: COLORS.muted, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  optInFeatures: { width: '100%', gap: 10, marginBottom: 32 },
  optInFeatureRow: { backgroundColor: COLORS.card, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  optInFeatureText: { fontSize: 14, color: COLORS.text },
  joinBtn: { backgroundColor: COLORS.blue, borderRadius: 14, paddingHorizontal: 32, paddingVertical: 16, width: '100%', alignItems: 'center', marginBottom: 16 },
  joinBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  optInSmall: { fontSize: 12, color: COLORS.dim, textAlign: 'center' },
});
