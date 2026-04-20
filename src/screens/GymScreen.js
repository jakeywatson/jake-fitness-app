import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, GYM_EXERCISES } from '../constants/data';
import { FREE_GYM_EXERCISES } from '../constants/config';
import UpgradePrompt from '../components/UpgradePrompt';

const getWeight = (ex, week) => ex.startWeight + Math.floor((week-1)/3)*ex.increment;

export default function GymScreen({ appState, dispatch, isPremium, onUpgrade }) {
  const { week = 1, checked = {} } = appState;
  const [expanded, setExpanded] = useState(null);

  const phase = Math.floor((week-1)/3)+1;
  const restTime = ['90s','75s','60s','60s'][phase-1];
  const phaseText = [
    'Learning the movements. Focus on form, not weight. Rest 90s between sets.',
    'Building confidence. Weights step up — keep form clean. Rest 75s.',
    'Strength phase. You should feel challenged by rep 8–9. Rest 60s.',
    'Final push. These weights should feel heavy. If not, go up. Rest 60s.',
  ][phase-1];

  const toggle = (key) => dispatch({ type:'TOGGLE_CHECK', payload: key });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Gym</Text>

      {/* Phase card */}
      <View style={styles.phaseCard}>
        <Text style={styles.phaseLabel}>PHASE {phase} OF 4 · WEEK {week}</Text>
        <Text style={styles.phaseText}>{phaseText}</Text>
      </View>

      {GYM_EXERCISES.map((ex, exIdx) => {
        const w = getWeight(ex, week);
        const isOpen = expanded === ex.id;
        const setsDone = Array.from({length:ex.sets},(_,si)=>!!checked[`w${week}_gym_${ex.id}_${si}`]).filter(Boolean).length;
        const allDone = setsDone === ex.sets;
        const isLocked = !isPremium && exIdx >= FREE_GYM_EXERCISES;

        if (isLocked) {
          return (
            <View key={ex.id} style={{marginBottom:10}}>
              <UpgradePrompt
                message={`${ex.name} and ${GYM_EXERCISES.length - FREE_GYM_EXERCISES - (exIdx - FREE_GYM_EXERCISES) + 1 > 0 ? GYM_EXERCISES.length - FREE_GYM_EXERCISES : 1} more exercises are in Premium. Unlock the full routine.`}
                onUpgrade={onUpgrade}
              />
            </View>
          );
        }

        return (
          <View key={ex.id} style={[styles.card, allDone && styles.cardDone, isOpen && styles.cardOpen]}>
            <TouchableOpacity style={styles.cardHeader} onPress={()=>setExpanded(isOpen?null:ex.id)}>
              <Text style={styles.exEmoji}>{ex.emoji}</Text>
              <View style={styles.exInfo}>
                <Text style={[styles.exName, allDone && styles.exNameDone]}>{ex.name}</Text>
                <Text style={styles.exSub}>{ex.muscle} · {ex.sets}×{ex.reps} · {ex.id==='plank'?`${w}s hold`:`${w} ${ex.unit}`}</Text>
              </View>
              <View style={styles.exRight}>
                <Text style={[styles.setCount, allDone && styles.setCountDone]}>{setsDone}/{ex.sets}</Text>
                <Text style={styles.chevron}>{isOpen?'▲':'▼'}</Text>
              </View>
            </TouchableOpacity>

            {isOpen && (
              <View style={styles.cardBody}>
                <Text style={styles.sectionLabel}>HOW TO DO IT</Text>
                {ex.how.map((step,i)=>(
                  <View key={i} style={styles.howRow}>
                    <Text style={styles.howNum}>{i+1}.</Text>
                    <Text style={styles.howText}>{step}</Text>
                  </View>
                ))}
                <View style={styles.tipBox}>
                  <Text style={styles.tipLabel}>TIP</Text>
                  <Text style={styles.tipText}>{ex.tip}</Text>
                </View>
                <View style={styles.targetRow}>
                  <Text style={styles.targetLabel}>Week {week} target</Text>
                  <Text style={styles.targetVal}>{ex.id==='plank'?`${w}s hold`:`${w} ${ex.unit}`}</Text>
                </View>
                <Text style={styles.sectionLabel}>LOG SETS — TAP WHEN DONE</Text>
                <View style={styles.setsRow}>
                  {Array.from({length:ex.sets},(_,si)=>{
                    const key = `w${week}_gym_${ex.id}_${si}`;
                    const done = !!checked[key];
                    return (
                      <TouchableOpacity key={si} style={[styles.setBtn, done && styles.setBtnDone]} onPress={()=>toggle(key)}>
                        <Text style={[styles.setBtnText, done && styles.setBtnTextDone]}>{done?'✓':`Set ${si+1}`}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <Text style={styles.restText}>Rest {restTime} between sets</Text>
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:COLORS.bg },
  content: { padding:16, paddingBottom:40 },
  pageTitle: { fontSize:28, fontWeight:'700', color:COLORS.text, marginBottom:16 },
  phaseCard: { backgroundColor:'#1a1035', borderRadius:12, padding:14, marginBottom:16, borderWidth:1, borderColor:COLORS.purple },
  phaseLabel: { fontSize:10, color:COLORS.purple, letterSpacing:2, marginBottom:4 },
  phaseText: { fontSize:12, color:COLORS.purpleLight, lineHeight:18 },
  card: { backgroundColor:COLORS.card, borderRadius:12, marginBottom:10, borderWidth:1, borderColor:COLORS.border, overflow:'hidden' },
  cardDone: { backgroundColor:COLORS.greenBg, borderColor:COLORS.greenDark },
  cardOpen: { borderColor:COLORS.purple },
  cardHeader: { flexDirection:'row', alignItems:'center', gap:12, padding:14 },
  exEmoji: { fontSize:22 },
  exInfo: { flex:1 },
  exName: { fontSize:14, fontWeight:'700', color:COLORS.text },
  exNameDone: { color:COLORS.green },
  exSub: { fontSize:11, color:COLORS.muted, marginTop:2 },
  exRight: { flexDirection:'row', alignItems:'center', gap:8 },
  setCount: { fontSize:11, color:COLORS.dim },
  setCountDone: { color:COLORS.green },
  chevron: { fontSize:11, color:'#334155' },
  cardBody: { padding:16, paddingTop:0 },
  sectionLabel: { fontSize:10, color:COLORS.purple, letterSpacing:2, marginBottom:8, marginTop:4 },
  howRow: { flexDirection:'row', gap:10, marginBottom:8 },
  howNum: { fontSize:11, color:COLORS.purple, fontWeight:'700', minWidth:16 },
  howText: { fontSize:12, color:COLORS.muted, lineHeight:18, flex:1 },
  tipBox: { backgroundColor:'#1a1035', borderLeftWidth:3, borderLeftColor:COLORS.purple, borderRadius:4, padding:12, marginBottom:14 },
  tipLabel: { fontSize:10, color:COLORS.purple, letterSpacing:1, marginBottom:3 },
  tipText: { fontSize:12, color:COLORS.purpleLight, lineHeight:18 },
  targetRow: { backgroundColor:COLORS.bg, borderRadius:8, padding:12, marginBottom:14, flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  targetLabel: { fontSize:11, color:COLORS.muted },
  targetVal: { fontSize:16, fontWeight:'700', color:COLORS.purpleLight },
  setsRow: { flexDirection:'row', gap:8, marginBottom:8 },
  setBtn: { flex:1, padding:14, borderRadius:10, borderWidth:2, borderColor:COLORS.border, backgroundColor:COLORS.bg, alignItems:'center' },
  setBtnDone: { borderColor:COLORS.purple, backgroundColor:COLORS.purpleDark },
  setBtnText: { fontSize:12, color:COLORS.dim, fontWeight:'700' },
  setBtnTextDone: { fontSize:16, color:COLORS.purpleLight },
  restText: { fontSize:11, color:COLORS.dim, textAlign:'center' },
});
