import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Linking,
} from 'react-native';
import { getOfferings, purchasePackage, restorePurchases } from '../utils/purchases';
import { COLORS } from '../constants/data';

const FEATURES_FREE = [
  '2 weeks of the running plan',
  '3 gym exercises',
  '2 HIIT workouts',
  'Weight tracking',
];

const FEATURES_PREMIUM = [
  'Full 12-week running plan with audio coaching',
  'All 6 gym exercises with progressive weights',
  'All 5 HIIT workouts',
  'Weight tracking + milestone celebrations',
  'Plan adapts to your fitness level',
];

export default function PaywallScreen({ onSubscribe, onContinueFree, onRestore }) {
  const [offerings, setOfferings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getOfferings().then(o => { setOfferings(o); setLoading(false); });
  }, []);

  const handlePurchase = async (pkg) => {
    setError(''); setPurchasing(true);
    try {
      const info = await purchasePackage(pkg);
      onSubscribe(info);
    } catch (e) {
      if (!e.userCancelled) setError(e.message || 'Purchase failed. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    const isPremium = await restorePurchases();
    setRestoring(false);
    if (isPremium) onRestore();
    else setError('No previous purchases found.');
  };

  // Fallback prices if RevenueCat not set up yet
  const monthly = offerings?.availablePackages?.find(p => p.packageType === 'MONTHLY');
  const annual = offerings?.availablePackages?.find(p => p.packageType === 'ANNUAL');
  const monthlyPrice = monthly?.product?.priceString || '£3.99';
  const annualPrice = annual?.product?.priceString || '£24.99';
  const annualMonthly = annual ? `${(parseFloat(annual.product.price) / 12).toFixed(2)}` : '2.08';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.emoji}>🏆</Text>
        <Text style={styles.title}>Unlock everything</Text>
        <Text style={styles.subtitle}>Get the full plan. See real results.</Text>
      </View>

      {/* Feature comparison */}
      <View style={styles.comparisonRow}>
        {/* Free */}
        <View style={[styles.compCard, styles.compCardFree]}>
          <Text style={styles.compTitle}>Free</Text>
          {FEATURES_FREE.map(f => (
            <View key={f} style={styles.featureRow}>
              <Text style={styles.featureCheckFree}>✓</Text>
              <Text style={styles.featureTextFree}>{f}</Text>
            </View>
          ))}
        </View>
        {/* Premium */}
        <View style={[styles.compCard, styles.compCardPremium]}>
          <Text style={styles.compTitle}>Premium</Text>
          {FEATURES_PREMIUM.map(f => (
            <View key={f} style={styles.featureRow}>
              <Text style={styles.featureCheckPremium}>✓</Text>
              <Text style={styles.featureTextPremium}>{f}</Text>
            </View>
          ))}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.blue} style={{ marginVertical: 24 }} />
      ) : (
        <View style={styles.plans}>
          {/* Annual — highlighted */}
          <TouchableOpacity
            style={styles.planCardAnnual}
            onPress={() => annual ? handlePurchase(annual) : null}
            disabled={purchasing}
          >
            <View style={styles.bestValueBadge}>
              <Text style={styles.bestValueText}>BEST VALUE — SAVE 48%</Text>
            </View>
            <Text style={styles.planName}>Annual</Text>
            <Text style={styles.planPrice}>{annualPrice}<Text style={styles.planPer}>/year</Text></Text>
            <Text style={styles.planSub}>Just £{annualMonthly}/month • Cancel anytime</Text>
            {purchasing
              ? <ActivityIndicator color="#fff" style={{ marginTop: 12 }} />
              : <Text style={styles.planCta}>Start annual plan →</Text>
            }
          </TouchableOpacity>

          {/* Monthly */}
          <TouchableOpacity
            style={styles.planCardMonthly}
            onPress={() => monthly ? handlePurchase(monthly) : null}
            disabled={purchasing}
          >
            <Text style={styles.planNameMonthly}>Monthly</Text>
            <Text style={styles.planPriceMonthly}>{monthlyPrice}<Text style={styles.planPerMonthly}>/month</Text></Text>
            <Text style={styles.planSubMonthly}>Cancel anytime</Text>
          </TouchableOpacity>
        </View>
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Continue free */}
      <TouchableOpacity style={styles.continueBtn} onPress={onContinueFree}>
        <Text style={styles.continueBtnText}>Continue with free plan</Text>
      </TouchableOpacity>

      {/* Restore + legal */}
      <View style={styles.legal}>
        <TouchableOpacity onPress={handleRestore} disabled={restoring}>
          <Text style={styles.legalLink}>{restoring ? 'Restoring...' : 'Restore purchases'}</Text>
        </TouchableOpacity>
        <Text style={styles.legalDot}>·</Text>
        <TouchableOpacity onPress={() => Linking.openURL('https://zeroto.fit/privacy')}>
          <Text style={styles.legalLink}>Privacy</Text>
        </TouchableOpacity>
        <Text style={styles.legalDot}>·</Text>
        <TouchableOpacity onPress={() => Linking.openURL('https://zeroto.fit/terms')}>
          <Text style={styles.legalLink}>Terms</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.legalNote}>
        Subscriptions auto-renew unless cancelled at least 24 hours before the end of the current period.
        Manage in Google Play Settings.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 20, paddingTop: 48, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 28 },
  emoji: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 26, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  subtitle: { fontSize: 15, color: COLORS.muted },
  comparisonRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  compCard: { flex: 1, borderRadius: 12, padding: 14, borderWidth: 1 },
  compCardFree: { backgroundColor: '#0f1520', borderColor: COLORS.border },
  compCardPremium: { backgroundColor: COLORS.blueDark, borderColor: COLORS.blue },
  compTitle: { fontSize: 12, fontWeight: '700', color: COLORS.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 },
  featureRow: { flexDirection: 'row', gap: 6, marginBottom: 8, alignItems: 'flex-start' },
  featureCheckFree: { fontSize: 12, color: COLORS.muted, marginTop: 1 },
  featureTextFree: { fontSize: 12, color: COLORS.muted, flex: 1, lineHeight: 18 },
  featureCheckPremium: { fontSize: 12, color: COLORS.green, marginTop: 1 },
  featureTextPremium: { fontSize: 12, color: COLORS.blueLight, flex: 1, lineHeight: 18 },
  plans: { gap: 10, marginBottom: 16 },
  planCardAnnual: { backgroundColor: COLORS.blue, borderRadius: 16, padding: 20, alignItems: 'center', position: 'relative', overflow: 'hidden' },
  bestValueBadge: { backgroundColor: COLORS.green, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 3, marginBottom: 12 },
  bestValueText: { fontSize: 10, fontWeight: '700', color: '#000', letterSpacing: 1 },
  planName: { fontSize: 14, color: 'rgba(255,255,255,0.7)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 },
  planPrice: { fontSize: 36, fontWeight: '700', color: '#fff' },
  planPer: { fontSize: 16, fontWeight: '400' },
  planSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4, marginBottom: 14 },
  planCta: { fontSize: 15, fontWeight: '700', color: '#fff' },
  planCardMonthly: { backgroundColor: '#0f1520', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#1e2d42', flexDirection: 'row', justifyContent: 'space-between' },
  planNameMonthly: { fontSize: 14, color: COLORS.muted },
  planPriceMonthly: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  planPerMonthly: { fontSize: 13, fontWeight: '400', color: COLORS.muted },
  planSubMonthly: { fontSize: 11, color: COLORS.dim },
  errorText: { color: COLORS.red, textAlign: 'center', fontSize: 13, marginBottom: 12 },
  continueBtn: { padding: 14, alignItems: 'center', marginBottom: 20 },
  continueBtnText: { color: COLORS.muted, fontSize: 14 },
  legal: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginBottom: 10 },
  legalLink: { color: COLORS.dim, fontSize: 12 },
  legalDot: { color: COLORS.dim, fontSize: 12 },
  legalNote: { fontSize: 10, color: '#334155', textAlign: 'center', lineHeight: 16 },
});
