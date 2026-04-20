import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput, Animated,
} from 'react-native';
import { COLORS, RUN_WEEKS } from '../constants/data';

const STEPS = [
  { id: 'welcome',  title: "Let's get you started", subtitle: "We'll set up a plan that fits you. Takes 60 seconds." },
  { id: 'weight',   title: 'What do you weigh now?', subtitle: 'This helps us track your progress accurately.' },
  { id: 'goal',     title: 'What\'s your goal weight?', subtitle: 'We\'ll show your progress toward this.' },
  { id: 'fitness',  title: 'How active are you right now?', subtitle: 'Be honest — we\'ll start you at the right level.' },
  { id: 'days',     title: 'How many days a week can you train?', subtitle: 'This sets your weekly plan.' },
  { id: 'ready',    title: 'Your plan is ready 🎉', subtitle: '' },
];

const FITNESS_OPTIONS = [
  { id: 'none',     label: 'Not at all',    sub: 'I rarely exercise',       runWeek: 1 },
  { id: 'little',   label: 'A little bit',  sub: 'Walk sometimes, gym rarely', runWeek: 1 },
  { id: 'some',     label: 'Somewhat',      sub: 'Exercise once or twice a week', runWeek: 3 },
  { id: 'regular',  label: 'Regularly',     sub: 'Exercise 3+ times a week', runWeek: 6 },
];

const DAYS_OPTIONS = [
  { id: 3, label: '3 days', sub: 'Recommended for beginners' },
  { id: 4, label: '4 days', sub: 'Good balance' },
  { id: 5, label: '5 days', sub: 'Committed' },
];

export default function OnboardingScreen({ user, onComplete }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState({
    weightStone: '',
    weightLbs: '',
    goalStone: '',
    goalLbs: '',
    fitness: null,
    days: 3,
  });

  const step = STEPS[stepIdx];
  const isLast = stepIdx === STEPS.length - 1;
  const isFirst = stepIdx === 0;

  const canAdvance = () => {
    if (step.id === 'weight') return (parseFloat(answers.weightStone) || 0) > 0;
    if (step.id === 'goal') return (parseFloat(answers.goalStone) || 0) > 0;
    if (step.id === 'fitness') return answers.fitness !== null;
    return true;
  };

  const advance = () => {
    if (isLast) {
      // Build initial state from answers
      const fitnessOption = FITNESS_OPTIONS.find(f => f.id === answers.fitness) || FITNESS_OPTIONS[0];
      const startLbs = (parseFloat(answers.weightStone) || 18) * 14 + (parseFloat(answers.weightLbs) || 0);
      const goalLbs = (parseFloat(answers.goalStone) || 14) * 14 + (parseFloat(answers.goalLbs) || 0);

      onComplete({
        runWeek: fitnessOption.runWeek,
        runSession: 1,
        completedRuns: [],
        week: 1,
        checked: {},
        wegovy: null,
        weights: [{ date: new Date().toISOString().split('T')[0], lbs: Math.round(startLbs * 10) / 10 }],
        goalLbs,
        trainingDays: answers.days,
        onboardingComplete: true,
      });
    } else {
      setStepIdx(i => i + 1);
    }
  };

  // Generate plan summary for final step
  const fitnessOption = FITNESS_OPTIONS.find(f => f.id === answers.fitness) || FITNESS_OPTIONS[0];
  const startWeek = fitnessOption.runWeek;
  const startLbs = (parseFloat(answers.weightStone) || 0) * 14 + (parseFloat(answers.weightLbs) || 0);
  const goalLbs = (parseFloat(answers.goalStone) || 0) * 14 + (parseFloat(answers.goalLbs) || 0);
  const lbsToStone = l => `${Math.floor(l/14)}st ${Math.round(l%14)}lb`;

  return (
    <View style={styles.container}>
      {/* Progress dots */}
      <View style={styles.dots}>
        {STEPS.map((_, i) => (
          <View key={i} style={[styles.dot, i <= stepIdx && styles.dotActive, i === stepIdx && styles.dotCurrent]} />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{step.title}</Text>
        {step.subtitle ? <Text style={styles.subtitle}>{step.subtitle}</Text> : null}

        {/* Welcome step */}
        {step.id === 'welcome' && (
          <View style={styles.welcomeFeatures}>
            {[
              ['🏃', 'Guided running plan', 'Audio coaching tells you exactly when to run and walk'],
              ['💪', 'Simple gym routine', 'Step-by-step instructions, weights auto-progress'],
              ['🔥', 'HIIT workouts', 'Body Coach style, 25 minutes, guided timer'],
              ['⚖️', 'Weight tracking', 'Log and chart your progress toward your goal'],
            ].map(([emoji, title, sub]) => (
              <View key={title} style={styles.featureRow}>
                <Text style={styles.featureEmoji}>{emoji}</Text>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{title}</Text>
                  <Text style={styles.featureSub}>{sub}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Weight input */}
        {step.id === 'weight' && (
          <View style={styles.inputGroup}>
            <View style={styles.inputRow}>
              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>Stone</Text>
                <TextInput
                  style={styles.input}
                  value={answers.weightStone}
                  onChangeText={v => setAnswers(a => ({ ...a, weightStone: v }))}
                  placeholder="18"
                  placeholderTextColor={COLORS.muted}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>Lbs</Text>
                <TextInput
                  style={styles.input}
                  value={answers.weightLbs}
                  onChangeText={v => setAnswers(a => ({ ...a, weightLbs: v }))}
                  placeholder="0"
                  placeholderTextColor={COLORS.muted}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <Text style={styles.hint}>Don't worry — this is just your starting point. It'll only go down from here.</Text>
          </View>
        )}

        {/* Goal weight input */}
        {step.id === 'goal' && (
          <View style={styles.inputGroup}>
            <View style={styles.inputRow}>
              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>Stone</Text>
                <TextInput
                  style={styles.input}
                  value={answers.goalStone}
                  onChangeText={v => setAnswers(a => ({ ...a, goalStone: v }))}
                  placeholder="14"
                  placeholderTextColor={COLORS.muted}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>Lbs</Text>
                <TextInput
                  style={styles.input}
                  value={answers.goalLbs}
                  onChangeText={v => setAnswers(a => ({ ...a, goalLbs: v }))}
                  placeholder="0"
                  placeholderTextColor={COLORS.muted}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <Text style={styles.hint}>Set a realistic goal. You can always adjust it later.</Text>
          </View>
        )}

        {/* Fitness level */}
        {step.id === 'fitness' && (
          <View style={styles.optionsList}>
            {FITNESS_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.id}
                style={[styles.optionCard, answers.fitness === opt.id && styles.optionCardActive]}
                onPress={() => setAnswers(a => ({ ...a, fitness: opt.id }))}
              >
                <View style={styles.optionContent}>
                  <Text style={[styles.optionLabel, answers.fitness === opt.id && styles.optionLabelActive]}>{opt.label}</Text>
                  <Text style={styles.optionSub}>{opt.sub}</Text>
                </View>
                <View style={[styles.radioOuter, answers.fitness === opt.id && styles.radioOuterActive]}>
                  {answers.fitness === opt.id && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Training days */}
        {step.id === 'days' && (
          <View style={styles.optionsList}>
            {DAYS_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.id}
                style={[styles.optionCard, answers.days === opt.id && styles.optionCardActive]}
                onPress={() => setAnswers(a => ({ ...a, days: opt.id }))}
              >
                <View style={styles.optionContent}>
                  <Text style={[styles.optionLabel, answers.days === opt.id && styles.optionLabelActive]}>{opt.label}</Text>
                  <Text style={styles.optionSub}>{opt.sub}</Text>
                </View>
                <View style={[styles.radioOuter, answers.days === opt.id && styles.radioOuterActive]}>
                  {answers.days === opt.id && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Plan summary */}
        {step.id === 'ready' && (
          <View style={styles.summary}>
            {[
              ['Starting weight', startLbs > 0 ? lbsToStone(startLbs) : '—'],
              ['Goal weight', goalLbs > 0 ? lbsToStone(goalLbs) : '—'],
              ['Run plan starts', `Week ${startWeek} of 12`],
              ['Training days', `${answers.days} days/week`],
              ['Gym phase', 'Phase 1 — Learning the movements'],
            ].map(([label, val]) => (
              <View key={label} style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{label}</Text>
                <Text style={styles.summaryVal}>{val}</Text>
              </View>
            ))}
            <View style={styles.summaryNote}>
              <Text style={styles.summaryNoteText}>
                Your plan adapts as you progress. You can always update these in settings.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navRow}>
        {!isFirst && (
          <TouchableOpacity style={styles.backBtn} onPress={() => setStepIdx(i => i - 1)}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextBtn, !canAdvance() && styles.nextBtnDisabled, isFirst && styles.nextBtnFull]}
          onPress={advance}
          disabled={!canAdvance()}
        >
          <Text style={styles.nextBtnText}>{isLast ? 'Start training →' : 'Continue →'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingTop: 56, paddingBottom: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.border },
  dotActive: { backgroundColor: COLORS.blueDark },
  dotCurrent: { backgroundColor: COLORS.blue, width: 20 },
  content: { padding: 24, paddingBottom: 16, flexGrow: 1 },
  title: { fontSize: 26, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  subtitle: { fontSize: 15, color: COLORS.muted, marginBottom: 28, lineHeight: 22 },
  welcomeFeatures: { gap: 16, marginTop: 8 },
  featureRow: { flexDirection: 'row', gap: 14, backgroundColor: COLORS.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  featureEmoji: { fontSize: 28 },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  featureSub: { fontSize: 12, color: COLORS.muted, lineHeight: 18 },
  inputGroup: { gap: 8 },
  inputRow: { flexDirection: 'row', gap: 12 },
  inputWrap: { flex: 1 },
  inputLabel: { fontSize: 11, color: COLORS.muted, marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' },
  input: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, color: COLORS.text, padding: 16, fontSize: 18, fontWeight: '600', textAlign: 'center' },
  hint: { fontSize: 13, color: COLORS.dim, textAlign: 'center', marginTop: 12, lineHeight: 20 },
  optionsList: { gap: 10 },
  optionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  optionCardActive: { borderColor: COLORS.blue, backgroundColor: COLORS.blueDark },
  optionContent: { flex: 1 },
  optionLabel: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  optionLabelActive: { color: COLORS.blueLight },
  optionSub: { fontSize: 12, color: COLORS.muted },
  radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: COLORS.border2, alignItems: 'center', justifyContent: 'center' },
  radioOuterActive: { borderColor: COLORS.blue },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.blue },
  summary: { gap: 0 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  summaryLabel: { fontSize: 13, color: COLORS.muted },
  summaryVal: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  summaryNote: { marginTop: 20, backgroundColor: COLORS.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  summaryNoteText: { fontSize: 13, color: COLORS.muted, textAlign: 'center', lineHeight: 20 },
  navRow: { flexDirection: 'row', padding: 20, paddingBottom: 36, gap: 12 },
  backBtn: { flex: 1, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  backBtnText: { color: COLORS.muted, fontSize: 15 },
  nextBtn: { flex: 2, padding: 16, borderRadius: 12, backgroundColor: COLORS.blue, alignItems: 'center' },
  nextBtnFull: { flex: 1 },
  nextBtnDisabled: { backgroundColor: COLORS.blueDark, opacity: 0.4 },
  nextBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
