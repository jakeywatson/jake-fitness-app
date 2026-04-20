import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, ActivityIndicator, Linking,
} from 'react-native';
import { COLORS } from '../constants/data';
import { signOut } from '../utils/supabase';
import { isStravaConnected, connectStrava, disconnectStrava } from '../utils/strava';
import { initHealthConnect } from '../utils/healthSync';
import { restorePurchases } from '../utils/purchases';

export default function SettingsScreen({ user, appState, dispatch, isPremium, onUpgrade }) {
  const [stravaConnected, setStravaConnected] = useState(false);
  const [stravaLoading, setStravaLoading] = useState(false);
  const [healthEnabled, setHealthEnabled] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    isStravaConnected().then(setStravaConnected);
  }, []);

  const handleStravaToggle = async () => {
    setStravaLoading(true);
    try {
      if (stravaConnected) {
        await disconnectStrava();
        setStravaConnected(false);
      } else {
        const tokens = await connectStrava();
        setStravaConnected(!!tokens);
      }
    } catch (e) {
      console.log('Strava error:', e.message);
    } finally {
      setStravaLoading(false);
    }
  };

  const handleHealthToggle = async (val) => {
    if (val) {
      const ok = await initHealthConnect();
      setHealthEnabled(ok);
    } else {
      setHealthEnabled(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    const ok = await restorePurchases();
    setRestoring(false);
    if (ok) dispatch({ type: 'SET_PROFILE', payload: { isPremiumOverride: true } });
  };

  const { weights, goalLbs, heightCm, ageYears, trainingDays } = appState;
  const latestLbs = weights?.length ? weights[weights.length - 1].lbs : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Settings</Text>

      {/* Account */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Email</Text>
            <Text style={styles.rowValue}>{user?.email || '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Plan</Text>
            <View style={[styles.badge, isPremium ? styles.badgePremium : styles.badgeFree]}>
              <Text style={[styles.badgeText, isPremium && styles.badgeTextPremium]}>
                {isPremium ? '⭐ Premium' : 'Free'}
              </Text>
            </View>
          </View>
          {!isPremium && (
            <TouchableOpacity style={styles.upgradeBtn} onPress={onUpgrade}>
              <Text style={styles.upgradeBtnText}>Upgrade to Premium — from £3.99/mo</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Profile */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>YOUR PROFILE</Text>
        <View style={styles.card}>
          {[
            ['Current weight', latestLbs ? `${Math.floor(latestLbs/14)}st ${Math.round(latestLbs%14)}lb` : '—'],
            ['Goal weight', goalLbs ? `${Math.floor(goalLbs/14)}st ${Math.round(goalLbs%14)}lb` : '—'],
            ['Height', heightCm ? `${heightCm}cm` : '—'],
            ['Age', ageYears ? `${ageYears}` : '—'],
            ['Training days', trainingDays ? `${trainingDays} days/week` : '—'],
          ].map(([label, val]) => (
            <View key={label} style={styles.row}>
              <Text style={styles.rowLabel}>{label}</Text>
              <Text style={styles.rowValue}>{val}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Integrations */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>INTEGRATIONS</Text>
        <View style={styles.card}>
          {/* Strava */}
          <View style={styles.integrationRow}>
            <View style={styles.integrationLeft}>
              <Text style={styles.integrationName}>🟠 Strava</Text>
              <Text style={styles.integrationSub}>
                {stravaConnected ? 'Runs post automatically after each session' : 'Auto-post completed runs to Strava'}
              </Text>
            </View>
            {stravaLoading
              ? <ActivityIndicator color={COLORS.blue} />
              : (
                <TouchableOpacity
                  style={[styles.connectBtn, stravaConnected && styles.connectBtnActive]}
                  onPress={handleStravaToggle}
                >
                  <Text style={[styles.connectBtnText, stravaConnected && styles.connectBtnTextActive]}>
                    {stravaConnected ? 'Connected ✓' : 'Connect'}
                  </Text>
                </TouchableOpacity>
              )
            }
          </View>

          <View style={styles.divider} />

          {/* Google Health Connect */}
          <View style={styles.integrationRow}>
            <View style={styles.integrationLeft}>
              <Text style={styles.integrationName}>💚 Google Health</Text>
              <Text style={styles.integrationSub}>
                Sync workouts and weight to Google Health Connect
              </Text>
            </View>
            <Switch
              value={healthEnabled}
              onValueChange={handleHealthToggle}
              trackColor={{ false: COLORS.border, true: COLORS.greenDark }}
              thumbColor={healthEnabled ? COLORS.green : COLORS.muted}
            />
          </View>

          <View style={styles.divider} />

          {/* Spotify */}
          <View style={styles.integrationRow}>
            <View style={styles.integrationLeft}>
              <Text style={styles.integrationName}>🎵 Spotify</Text>
              <Text style={styles.integrationSub}>Open a workout playlist when you start training</Text>
            </View>
            <TouchableOpacity
              style={styles.connectBtn}
              onPress={() => Linking.openURL('spotify:playlist:37i9dQZF1DX76Wlfdnj7AP')}
            >
              <Text style={styles.connectBtnText}>Open →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Community */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>COMMUNITY</Text>
        <View style={styles.card}>
          <View style={styles.integrationRow}>
            <View style={styles.integrationLeft}>
              <Text style={styles.rowLabel}>Activity feed</Text>
              <Text style={styles.integrationSub}>Share completed workouts with nearby users</Text>
            </View>
            <Switch
              value={!!appState.feedOptIn}
              onValueChange={(val) => dispatch({ type: val ? 'FEED_OPT_IN' : 'FEED_OPT_OUT' })}
              trackColor={{ false: COLORS.border, true: COLORS.blueDark }}
              thumbColor={appState.feedOptIn ? COLORS.blueLight : COLORS.muted}
            />
          </View>
        </View>
      </View>

      {/* Support */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>SUPPORT</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={handleRestore}>
            <Text style={styles.rowLabel}>{restoring ? 'Restoring...' : 'Restore purchases'}</Text>
            <Text style={styles.rowChevron}>›</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.row}
            onPress={() => Linking.openURL('mailto:hello@zeroto.fit')}
          >
            <Text style={styles.rowLabel}>Contact support</Text>
            <Text style={styles.rowChevron}>›</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.row}
            onPress={() => Linking.openURL('https://zeroto.fit/privacy')}
          >
            <Text style={styles.rowLabel}>Privacy policy</Text>
            <Text style={styles.rowChevron}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sign out */}
      <TouchableOpacity style={styles.signOutBtn} onPress={() => signOut()}>
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Zero to Fit · v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingTop: 52, paddingBottom: 60 },
  pageTitle: { fontSize: 28, fontWeight: '700', color: COLORS.text, marginBottom: 24 },
  section: { marginBottom: 20 },
  sectionLabel: { fontSize: 10, letterSpacing: 3, color: COLORS.muted, textTransform: 'uppercase', marginBottom: 8, marginLeft: 4 },
  card: { backgroundColor: COLORS.card, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  rowLabel: { fontSize: 14, color: COLORS.text },
  rowValue: { fontSize: 14, color: COLORS.muted },
  rowChevron: { fontSize: 20, color: COLORS.muted },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: COLORS.bg },
  badgePremium: { backgroundColor: '#1a1500' },
  badgeText: { fontSize: 12, color: COLORS.muted },
  badgeTextPremium: { color: COLORS.yellow },
  upgradeBtn: { margin: 12, marginTop: 4, backgroundColor: '#1a1035', borderRadius: 10, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.purple },
  upgradeBtnText: { color: COLORS.purpleLight, fontSize: 13, fontWeight: '700' },
  integrationRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  integrationLeft: { flex: 1 },
  integrationName: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  integrationSub: { fontSize: 12, color: COLORS.muted, lineHeight: 17 },
  connectBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.bg },
  connectBtnActive: { borderColor: COLORS.green, backgroundColor: COLORS.greenBg },
  connectBtnText: { fontSize: 13, color: COLORS.muted, fontWeight: '600' },
  connectBtnTextActive: { color: COLORS.green },
  divider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: 14 },
  signOutBtn: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 16 },
  signOutText: { color: COLORS.dim, fontSize: 14 },
  version: { fontSize: 12, color: COLORS.dim, textAlign: 'center' },
});
