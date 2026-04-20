import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import * as Speech from 'expo-speech';
import * as KeepAwake from 'expo-keep-awake';
import { COLORS, RUN_WEEKS } from '../constants/data';
import { FREE_RUN_WEEKS } from '../constants/config';
import UpgradePrompt from '../components/UpgradePrompt';

const fmt = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

function buildSequence(weekData) {
  const seq = [];
  seq.push({ type:'warmup', label:'Warm-up Walk', secs: weekData.warmup, color: COLORS.blueLight });
  for (let i = 0; i < weekData.reps; i++) {
    seq.push({ type:'run', label:'RUN', secs: weekData.intervals[0].secs, color: COLORS.green, rep: i+1 });
    seq.push({ type:'walk', label:'Walk', secs: weekData.intervals[1].secs, color: COLORS.blueLight, rep: i+1 });
  }
  seq.push({ type:'cooldown', label:'Cool-down Walk', secs: weekData.cooldown, color: COLORS.blueLight });
  return seq;
}

export default function RunScreen({ appState, dispatch, isPremium, onUpgrade }) {
  const { runWeek, runSession, completedRuns } = appState;
  const [screen, setScreen] = useState('overview'); // overview | running | done
  const [seqIdx, setSeqIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);
  const elapsedRef = useRef(null);
  const weekData = RUN_WEEKS[runWeek - 1];
  const sequence = buildSequence(weekData);

  const speak = useCallback((text) => {
    Speech.stop().then(() => {
      Speech.speak(text, { language: 'en-GB', rate: 0.9, pitch: 1.0 });
    }).catch(() => {
      Speech.speak(text, { language: 'en-GB', rate: 0.9, pitch: 1.0 });
    });
  }, []);

  const totalRunSecs = weekData.intervals[0].secs * weekData.reps;
  const totalWalkSecs = weekData.intervals[1].secs * weekData.reps;
  const totalMins = Math.round((weekData.warmup + weekData.cooldown + totalRunSecs + totalWalkSecs) / 60);

  useEffect(() => {
    if (screen === 'running') KeepAwake.activateKeepAwakeAsync();
    else KeepAwake.deactivateKeepAwake();
    return () => KeepAwake.deactivateKeepAwake();
  }, [screen]);

  const startRun = () => {
    const seq = sequence;
    setSeqIdx(0);
    setTimeLeft(seq[0].secs);
    setElapsed(0);
    setRunning(false);
    setScreen('running');
    speak(`Week ${runWeek}, Session ${runSession}. Starting with a ${Math.floor(weekData.warmup/60)} minute warm-up walk.`);
  };

  const advanceStep = useCallback((currentIdx) => {
    const next = currentIdx + 1;
    if (next >= sequence.length) {
      clearInterval(timerRef.current);
      clearInterval(elapsedRef.current);
      setRunning(false);
      setScreen('done');
      speak('Workout complete! Well done Jake. That\'s another session in the bag.');
      return;
    }
    const step = sequence[next];
    setSeqIdx(next);
    setTimeLeft(step.secs);
    if (step.type === 'run') speak(`Go! Run now. Interval ${step.rep} of ${weekData.reps}.`);
    else if (step.type === 'walk') speak(`Walk now. Nice work.`);
    else if (step.type === 'cooldown') speak('Last stretch. Cool-down walk. You\'ve done it.');
  }, [sequence, weekData.reps, speak]);

  const toggleTimer = () => {
    if (!running) {
      setRunning(true);
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            setSeqIdx(idx => { advanceStep(idx); return idx; });
            return 0;
          }
          if (t === 4) {
            setSeqIdx(idx => {
              const next = idx + 1;
              if (next < sequence.length) {
                const step = sequence[next];
                const msg = step.type === 'run' ? 'Get ready to run' : step.type === 'walk' ? 'Get ready to walk' : '';
                if (msg) speak(msg);
              }
              return idx;
            });
          }
          return t - 1;
        });
      }, 1000);
      elapsedRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      setRunning(false);
      clearInterval(timerRef.current);
      clearInterval(elapsedRef.current);
      speak('Paused.');
    }
  };

  const finishSession = () => {
    const key = `${runWeek}_${runSession}`;
    const newCompleted = [...(completedRuns || []), key];
    let newWeek = runWeek, newSession = runSession + 1;
    if (newSession > 3) { newSession = 1; newWeek = Math.min(runWeek + 1, 12); }
    dispatch({ type:'COMPLETE_RUN', payload: { completedRuns: newCompleted, runWeek: newWeek, runSession: newSession }});
    setScreen('overview');
  };

  const step = sequence[seqIdx];
  const totalSecs = sequence.reduce((a,s)=>a+s.secs,0);
  const doneSecs = sequence.slice(0,seqIdx).reduce((a,s)=>a+s.secs,0) + (step ? step.secs - timeLeft : 0);
  const pct = Math.min(100, Math.round((doneSecs/totalSecs)*100));

  if (screen === 'overview') {
    const sessionsDone = (completedRuns||[]).filter(k=>k.startsWith(`${runWeek}_`)).length;
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>Running</Text>

        {/* Current session card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>UP NEXT</Text>
          <Text style={styles.heroWeek}>Week {runWeek} · Session {runSession}</Text>
          <View style={styles.statsRow}>
            {[
              [fmt(weekData.intervals[0].secs), 'Run'],
              [fmt(weekData.intervals[1].secs), 'Walk'],
              [`×${weekData.reps}`, 'Reps'],
              [`~${totalMins}m`, 'Total'],
            ].map(([v,l]) => (
              <View key={l} style={styles.statItem}>
                <Text style={styles.statVal}>{v}</Text>
                <Text style={styles.statLabel}>{l}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => {
              if (!isPremium && runWeek > FREE_RUN_WEEKS) {
                onUpgrade && onUpgrade();
              } else {
                startRun();
              }
            }}
          >
            <Text style={styles.startBtnText}>
              {!isPremium && runWeek > FREE_RUN_WEEKS ? '🔒  Unlock to Continue' : '▶  Start Run'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Week progress */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>WEEK {runWeek} SESSIONS</Text>
          <View style={styles.sessionDots}>
            {[1,2,3].map(s => {
              const done = (completedRuns||[]).includes(`${runWeek}_${s}`);
              const current = s === runSession && !done;
              return (
                <View key={s} style={[styles.dot, done && styles.dotDone, current && styles.dotCurrent]}>
                  <Text style={[styles.dotText, (done||current) && styles.dotTextActive]}>{done ? '✓' : s}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Week overview */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>12-WEEK PLAN</Text>
          <View style={styles.weekGrid}>
            {RUN_WEEKS.map(w => {
              const sessions = [1,2,3].map(s=>(completedRuns||[]).includes(`${w.week}_${s}`));
              const allDone = sessions.every(Boolean);
              const isCurrent = w.week === runWeek;
              return (
                <View key={w.week} style={[styles.weekCell, allDone && styles.weekCellDone, isCurrent && styles.weekCellCurrent]}>
                  <Text style={[styles.weekCellText, allDone && styles.weekCellTextDone, isCurrent && styles.weekCellTextCurrent]}>{w.week}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    );
  }

  if (screen === 'running') {
    return (
      <View style={[styles.playerContainer, { backgroundColor: step?.type === 'run' ? '#0c2010' : '#0a1628' }]}>
        {/* Top bar */}
        <View style={styles.playerTop}>
          <View>
            <Text style={styles.playerTopLabel}>Week {runWeek} · Session {runSession}</Text>
            <Text style={styles.playerTopSub}>{fmt(elapsed)} elapsed</Text>
          </View>
          <TouchableOpacity onPress={() => {
            clearInterval(timerRef.current); clearInterval(elapsedRef.current);
            Speech.stop().catch(()=>{}); setScreen('overview');
          }} style={styles.exitBtn}>
            <Text style={styles.exitBtnText}>✕ Exit</Text>
          </TouchableOpacity>
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: step?.type === 'run' ? COLORS.green : COLORS.blue }]} />
        </View>

        {/* Main content */}
        <View style={styles.playerBody}>
          <Text style={styles.playerPhaseLabel}>{step?.type === 'run' ? `Interval ${step.rep} of ${weekData.reps}` : step?.type === 'walk' ? `Recovery ${step.rep} of ${weekData.reps}` : step?.label}</Text>
          <Text style={[styles.playerPhaseName, { color: step?.color || COLORS.text }]}>{step?.label}</Text>

          {/* Big timer */}
          <View style={[styles.timerCircle, { borderColor: step?.color || COLORS.border }]}>
            <Text style={[styles.timerText, { color: step?.color || COLORS.text }]}>{fmt(timeLeft)}</Text>
          </View>

          {/* Next up */}
          {seqIdx < sequence.length - 1 && (
            <View style={styles.nextUpCard}>
              <Text style={styles.nextUpLabel}>NEXT</Text>
              <Text style={styles.nextUpVal}>{sequence[seqIdx + 1]?.label} · {fmt(sequence[seqIdx + 1]?.secs)}</Text>
            </View>
          )}
        </View>

        {/* Controls */}
        <View style={styles.playerControls}>
          <TouchableOpacity
            style={[styles.playBtn, { backgroundColor: running ? COLORS.redDark : step?.type === 'run' ? '#16a34a' : COLORS.blueDark }]}
            onPress={toggleTimer}
          >
            <Text style={styles.playBtnText}>{running ? '⏸  Pause' : '▶  Start'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (screen === 'done') {
    return (
      <View style={styles.doneContainer}>
        <Text style={styles.doneEmoji}>🎉</Text>
        <Text style={styles.doneTitle}>Session Complete!</Text>
        <Text style={styles.doneSub}>Week {runWeek} · Session {runSession}</Text>
        <Text style={styles.doneStats}>{fmt(elapsed)} · {weekData.reps} intervals</Text>
        <TouchableOpacity style={styles.doneBtn} onPress={finishSession}>
          <Text style={styles.doneBtnText}>✓  Save & Continue</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.doneSecondary} onPress={() => setScreen('overview')}>
          <Text style={styles.doneSecondaryText}>Back without saving</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor: COLORS.bg },
  content: { padding:16, paddingBottom:40 },
  pageTitle: { fontSize:28, fontWeight:'700', color:COLORS.text, marginBottom:16 },
  heroCard: { backgroundColor: COLORS.blueDark, borderRadius:16, padding:20, marginBottom:12, borderWidth:1, borderColor:COLORS.blue },
  heroLabel: { fontSize:10, letterSpacing:3, color:COLORS.blueLight, marginBottom:4 },
  heroWeek: { fontSize:22, fontWeight:'700', color:'#fff', marginBottom:16 },
  statsRow: { flexDirection:'row', justifyContent:'space-around', marginBottom:20 },
  statItem: { alignItems:'center' },
  statVal: { fontSize:20, fontWeight:'700', color:COLORS.blueLight },
  statLabel: { fontSize:10, color:COLORS.muted, marginTop:2, textTransform:'uppercase', letterSpacing:1 },
  startBtn: { backgroundColor:COLORS.blue, borderRadius:12, padding:16, alignItems:'center' },
  startBtnText: { color:'#fff', fontSize:16, fontWeight:'700' },
  card: { backgroundColor:COLORS.card, borderRadius:12, padding:16, marginBottom:12, borderWidth:1, borderColor:COLORS.border },
  cardLabel: { fontSize:10, letterSpacing:3, color:COLORS.muted, marginBottom:12 },
  sessionDots: { flexDirection:'row', gap:12 },
  dot: { width:50, height:50, borderRadius:25, backgroundColor:COLORS.bg, borderWidth:2, borderColor:COLORS.border2, alignItems:'center', justifyContent:'center' },
  dotDone: { backgroundColor:COLORS.greenBg, borderColor:COLORS.greenDark },
  dotCurrent: { backgroundColor:COLORS.blueDark, borderColor:COLORS.blue },
  dotText: { fontSize:16, color:COLORS.dim },
  dotTextActive: { color:COLORS.green },
  weekGrid: { flexDirection:'row', flexWrap:'wrap', gap:6 },
  weekCell: { width:40, height:40, borderRadius:8, backgroundColor:COLORS.bg, borderWidth:1, borderColor:COLORS.border, alignItems:'center', justifyContent:'center' },
  weekCellDone: { backgroundColor:'#1a3a2a', borderColor:COLORS.greenDark },
  weekCellCurrent: { backgroundColor:COLORS.blueDark, borderColor:COLORS.blue },
  weekCellText: { fontSize:12, color:COLORS.dim },
  weekCellTextDone: { color:COLORS.green },
  weekCellTextCurrent: { color:COLORS.blueLight, fontWeight:'700' },
  playerContainer: { flex:1 },
  playerTop: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:20, borderBottomWidth:1, borderBottomColor:COLORS.border },
  playerTopLabel: { fontSize:13, color:COLORS.muted, letterSpacing:1 },
  playerTopSub: { fontSize:11, color:COLORS.dim, marginTop:2 },
  exitBtn: { backgroundColor:COLORS.card, borderRadius:8, paddingHorizontal:14, paddingVertical:8 },
  exitBtnText: { color:COLORS.muted, fontSize:12 },
  progressTrack: { height:4, backgroundColor:COLORS.border },
  progressFill: { height:4 },
  playerBody: { flex:1, alignItems:'center', justifyContent:'center', padding:24, gap:16 },
  playerPhaseLabel: { fontSize:12, color:COLORS.muted, letterSpacing:3, textTransform:'uppercase' },
  playerPhaseName: { fontSize:28, fontWeight:'700' },
  timerCircle: { width:180, height:180, borderRadius:90, borderWidth:4, alignItems:'center', justifyContent:'center', marginVertical:8 },
  timerText: { fontSize:56, fontWeight:'700', fontVariant:['tabular-nums'] },
  nextUpCard: { backgroundColor:COLORS.card, borderRadius:10, paddingHorizontal:20, paddingVertical:12, borderWidth:1, borderColor:COLORS.border, alignItems:'center' },
  nextUpLabel: { fontSize:9, color:COLORS.muted, letterSpacing:2 },
  nextUpVal: { fontSize:14, color:COLORS.text, marginTop:2, fontWeight:'600' },
  playerControls: { padding:24, paddingBottom:40 },
  playBtn: { borderRadius:14, padding:20, alignItems:'center' },
  playBtnText: { color:'#fff', fontSize:18, fontWeight:'700' },
  doneContainer: { flex:1, backgroundColor:'#0d2018', alignItems:'center', justifyContent:'center', padding:32 },
  doneEmoji: { fontSize:64, marginBottom:16 },
  doneTitle: { fontSize:28, fontWeight:'700', color:COLORS.green, marginBottom:8 },
  doneSub: { fontSize:16, color:COLORS.muted, marginBottom:4 },
  doneStats: { fontSize:14, color:COLORS.dim, marginBottom:32 },
  doneBtn: { backgroundColor:COLORS.greenDark, borderRadius:12, paddingHorizontal:32, paddingVertical:16, marginBottom:12, width:'100%', alignItems:'center' },
  doneBtnText: { color:'#fff', fontSize:16, fontWeight:'700' },
  doneSecondary: { padding:12 },
  doneSecondaryText: { color:COLORS.dim, fontSize:13 },
});
