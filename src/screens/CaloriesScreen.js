import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
} from 'react-native';
import Svg, { Circle, Path, Line, Text as SvgText } from 'react-native-svg';
import { COLORS } from '../constants/data';
import {
  calcTDEE, calcDailyTarget, estimateWeeksToGoal,
  calorieEquivalent, lbsToKg, lbsToStone,
} from '../utils/calories';
import { SAFE_DEFICIT } from '../constants/config';

export default function CaloriesScreen({ appState, dispatch, isPremium, onUpgrade }) {
  const { weights, goalLbs, trainingDays, calorieBurns = [], heightCm, ageYears } = appState;
  const latestLbs = weights?.length ? weights[weights.length - 1].lbs : 252;
  const weightKg = lbsToKg(latestLbs);

  // TDEE calculation
  const tdee = calcTDEE({
    weightKg,
    heightCm: heightCm || 188, // default to Jake's height
    ageYears: ageYears || 32,
    activityLevel: trainingDays >= 5 ? 'active' : trainingDays >= 3 ? 'moderate' : 'light',
  });
  const dailyTarget = calcDailyTarget({ tdee });
  const deficit = tdee - dailyTarget;

  // This week's burns
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekBurns = calorieBurns.filter(b => new Date(b.date) >= weekStart);
  const weeklyBurnTotal = weekBurns.reduce((sum, b) => sum + b.calories, 0);
  const weeklyDeficit = weeklyBurnTotal + (deficit * 7);
  const weeksToGoal = estimateWeeksToGoal({
    currentLbs: latestLbs,
    goalLbs: goalLbs || 196,
    weeklyDeficit,
  });

  // Donut chart for daily target
  const donutPct = Math.min(1, (weeklyBurnTotal / 7) / (dailyTarget || 1));
  const RADIUS = 60;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const strokeDash = CIRCUMFERENCE * donutPct;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Calories</Text>

      {/* Daily target card */}
      <View style={styles.heroCard}>
        <View style={styles.heroLeft}>
          <Text style={styles.heroLabel}>DAILY TARGET</Text>
          <Text style={styles.heroNumber}>{dailyTarget.toLocaleString()}</Text>
          <Text style={styles.heroUnit}>kcal / day</Text>
          <Text style={styles.heroSub}>Based on your weight,{'\n'}height & training days</Text>
        </View>
        <Svg width={150} height={150} viewBox="0 0 150 150">
          <Circle cx={75} cy={75} r={RADIUS} fill="none" stroke={COLORS.border} strokeWidth={12} />
          <Circle
            cx={75} cy={75} r={RADIUS} fill="none"
            stroke={COLORS.green} strokeWidth={12}
            strokeDasharray={`${strokeDash} ${CIRCUMFERENCE}`}
            strokeLinecap="round"
            transform="rotate(-90 75 75)"
          />
          <SvgText x={75} y={70} textAnchor="middle" fontSize={22} fontWeight="700" fill={COLORS.text}>
            {Math.round(donutPct * 100)}%
          </SvgText>
          <SvgText x={75} y={90} textAnchor="middle" fontSize={11} fill={COLORS.muted}>
            of target
          </SvgText>
        </Svg>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        {[
          ['Maintenance', tdee.toLocaleString(), 'kcal/day', COLORS.muted],
          ['Deficit', deficit.toLocaleString(), 'kcal/day', COLORS.blue],
          ['Exercise this week', weeklyBurnTotal.toLocaleString(), 'kcal', COLORS.green],
        ].map(([label, val, unit, color]) => (
          <View key={label} style={styles.statCard}>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={[styles.statVal, { color }]}>{val}</Text>
            <Text style={styles.statUnit}>{unit}</Text>
          </View>
        ))}
      </View>

      {/* Weekly deficit summary */}
      <View style={styles.deficitCard}>
        <Text style={styles.deficitLabel}>WEEKLY DEFICIT</Text>
        <Text style={styles.deficitNumber}>{weeklyDeficit.toLocaleString()} kcal</Text>
        <Text style={styles.deficitSub}>
          ≈ {(weeklyDeficit * 0.000286).toFixed(2)} lbs of fat this week
        </Text>
        {weeksToGoal && (
          <View style={styles.goalRow}>
            <Text style={styles.goalText}>
              At this pace: goal weight in ~{weeksToGoal} weeks
            </Text>
          </View>
        )}
      </View>

      {/* Recent burns */}
      <View style={styles.burnsCard}>
        <Text style={styles.burnsTitle}>RECENT WORKOUTS</Text>
        {weekBurns.length === 0 ? (
          <Text style={styles.burnsEmpty}>
            Complete a workout to see your calorie burns here. They're automatically tracked after every session.
          </Text>
        ) : (
          weekBurns.slice().reverse().map((burn, i) => (
            <View key={i} style={styles.burnRow}>
              <Text style={styles.burnEmoji}>
                {burn.type === 'run' ? '🏃' : burn.type === 'hiit' ? '🔥' : '💪'}
              </Text>
              <View style={styles.burnInfo}>
                <Text style={styles.burnName}>{burn.name}</Text>
                <Text style={styles.burnDate}>{burn.date} · {burn.durationMins} min</Text>
              </View>
              <View style={styles.burnCals}>
                <Text style={styles.burnCalNumber}>{burn.calories}</Text>
                <Text style={styles.burnCalUnit}>kcal</Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* How it's calculated */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>HOW WE CALCULATE THIS</Text>
        <Text style={styles.infoText}>
          Your daily calorie target uses the Mifflin-St Jeor equation adjusted for your activity level, minus a {SAFE_DEFICIT} kcal/day deficit — roughly 0.5 lbs per week from diet alone.{'\n\n'}
          Workout calories use MET values (Metabolic Equivalent of Task) — a validated method that estimates burn from activity type, duration, and body weight.{'\n\n'}
          These are estimates (±15%). The goal is useful direction, not laboratory precision.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 40 },
  pageTitle: { fontSize: 28, fontWeight: '700', color: COLORS.text, marginBottom: 16, paddingTop: 8 },
  heroCard: { backgroundColor: '#0f1520', borderRadius: 16, padding: 20, marginBottom: 12, borderWidth: 1, borderColor: '#1e2d42', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroLeft: { flex: 1 },
  heroLabel: { fontFamily:'Inter_500Medium', fontSize:11, letterSpacing:0.5, color:'#4d6278', textTransform: 'uppercase', marginBottom: 6 },
  heroNumber: { fontSize: 42, fontWeight: '700', color: COLORS.text, lineHeight: 48 },
  heroUnit: { fontSize: 13, color: COLORS.muted, marginBottom: 8 },
  heroSub: { fontSize: 12, color: COLORS.dim, lineHeight: 18 },
  statsRow: { gap: 8, marginBottom: 12 },
  statCard: { backgroundColor: '#0f1520', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#1e2d42', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statLabel: { fontSize: 13, color: COLORS.muted, flex: 1 },
  statVal: { fontSize: 18, fontWeight: '700', marginRight: 4 },
  statUnit: { fontSize: 11, color: COLORS.dim, width: 60, textAlign: 'right' },
  deficitCard: { backgroundColor: COLORS.greenBg, borderRadius: 14, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: COLORS.greenDark },
  deficitLabel: { fontSize: 10, letterSpacing: 3, color: COLORS.green, textTransform: 'uppercase', marginBottom: 6 },
  deficitNumber: { fontSize: 32, fontWeight: '700', color: COLORS.green, marginBottom: 4 },
  deficitSub: { fontSize: 13, color: COLORS.muted, marginBottom: 8 },
  goalRow: { backgroundColor: '#0f1520', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: COLORS.greenDark },
  goalText: { fontSize: 13, color: COLORS.text },
  burnsCard: { backgroundColor: '#0f1520', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  burnsTitle: { fontFamily:'Inter_500Medium', fontSize:11, letterSpacing:0.5, color:'#4d6278', textTransform: 'uppercase', marginBottom: 12 },
  burnsEmpty: { fontSize: 13, color: COLORS.dim, lineHeight: 20 },
  burnRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  burnEmoji: { fontSize: 22, marginRight: 12 },
  burnInfo: { flex: 1 },
  burnName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  burnDate: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  burnCals: { alignItems: 'flex-end' },
  burnCalNumber: { fontSize: 18, fontWeight: '700', color: COLORS.green },
  burnCalUnit: { fontSize: 11, color: COLORS.muted },
  infoCard: { backgroundColor: '#0f1520', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  infoTitle: { fontFamily:'Inter_500Medium', fontSize:11, letterSpacing:0.5, color:'#4d6278', textTransform: 'uppercase', marginBottom: 10 },
  infoText: { fontSize: 13, color: COLORS.dim, lineHeight: 20 },
});
