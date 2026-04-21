import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import Svg, { Line, Path, Circle, Text as SvgText } from 'react-native-svg';
import { COLORS, MILESTONES } from '../constants/data';

const lbsToStone = l => `${Math.floor(l/14)}st ${Math.round(l%14)}lb`;
const lbsToKg = l => `${(l * 0.453592).toFixed(1)} kg`;
const todayStr = () => new Date().toISOString().split('T')[0];

export default function WeightScreen({ appState, dispatch, isPremium, onUpgrade }) {
  const { weights = [], goalLbs } = appState;
  const GOAL_LBS = goalLbs || 196;
  const START_LBS = weights.length ? Math.max(...weights.map(d=>d.lbs)) : GOAL_LBS + 56;

  const [stoneVal, setStoneVal] = useState('');
  const [lbVal, setLbVal] = useState('');
  const [unit, setUnit] = useState('stone'); // stone | lbs | kg

  const latest = weights.length ? weights[weights.length-1].lbs : START_LBS;
  const lowest = weights.length ? Math.min(...weights.map(d=>d.lbs)) : START_LBS;
  // lost = positive means lost weight (good), negative means gained
  const lost = START_LBS - latest;
  const toGo = latest - GOAL_LBS;
  const pct = Math.max(0, Math.min(100, Math.round(((START_LBS-latest)/(START_LBS-GOAL_LBS||1))*100)));

  const formatWeight = (lbs) => {
    if (unit === 'kg') return lbsToKg(lbs);
    if (unit === 'lbs') return `${Math.round(lbs)} lbs`;
    return lbsToStone(lbs);
  };

  const addWeight = () => {
    let lbs;
    if (unit === 'stone') {
      lbs = (parseFloat(stoneVal)||0)*14 + (parseFloat(lbVal)||0);
    } else if (unit === 'lbs') {
      lbs = parseFloat(stoneVal);
    } else {
      // kg input
      lbs = (parseFloat(stoneVal)||0) / 0.453592;
    }
    if (!lbs || lbs < 50 || lbs > 700) {
      Alert?.alert?.('Check weight', 'Please enter a valid weight.');
      return;
    }
    const entry = { date: todayStr(), lbs: Math.round(lbs*10)/10 };
    const newWeights = [...weights.filter(w=>w.date!==entry.date), entry].sort((a,b)=>a.date.localeCompare(b.date));
    dispatch({ type:'SET_WEIGHTS', payload: newWeights });
    setStoneVal(''); setLbVal('');
  };

  const deleteWeight = (date) => {
    Alert.alert('Delete entry', `Remove entry for ${date}?`, [
      { text:'Cancel', style:'cancel' },
      { text:'Delete', style:'destructive', onPress:()=>dispatch({ type:'SET_WEIGHTS', payload: weights.filter(w=>w.date!==date) }) }
    ]);
  };

  const clearAll = () => {
    Alert.alert('Clear all entries', 'Remove all your logged weights? This cannot be undone.', [
      { text:'Cancel', style:'cancel' },
      { text:'Clear all', style:'destructive', onPress:()=>dispatch({ type:'SET_WEIGHTS', payload:[] }) }
    ]);
  };

  // SVG chart
  const chartW = 300, chartH = 120;
  const data = weights;
  const minL = data.length ? Math.min(...data.map(d=>d.lbs), GOAL_LBS) - 5 : GOAL_LBS - 5;
  const maxL = data.length ? Math.max(...data.map(d=>d.lbs)) + 5 : START_LBS + 5;
  const tx = i => (i/(data.length-1||1))*chartW;
  const ty = l => chartH - ((l-minL)/(maxL-minL))*chartH;
  const gY = ty(GOAL_LBS);
  const pathD = data.length > 1 ? data.map((d,i)=>`${i===0?'M':'L'}${tx(i).toFixed(1)},${ty(d.lbs).toFixed(1)}`).join(' ') : '';

  const lostLabel = lost >= 0
    ? `${Math.abs(Math.round(lost*10)/10)} lbs`
    : `+${Math.abs(Math.round(lost*10)/10)} lbs`;
  const lostColor = lost >= 0 ? COLORS.green : COLORS.red;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Weight</Text>

      {/* Stats grid */}
      <View style={styles.statsGrid}>
        {[
          ['Current', formatWeight(latest), COLORS.text],
          ['Goal', formatWeight(GOAL_LBS), COLORS.green],
          ['Lost', lostLabel, lostColor],
          ['To go', toGo > 0 ? `${toGo.toFixed(1)} lbs` : '🎯 Reached!', toGo > 0 ? COLORS.yellow : COLORS.green],
        ].map(([l,v,c])=>(
          <View key={l} style={styles.statCard}>
            <Text style={styles.statCardLabel}>{l}</Text>
            <Text style={[styles.statCardVal, {color:c}]}>{v}</Text>
          </View>
        ))}
      </View>

      {/* Progress */}
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.cardLabel}>PROGRESS TO GOAL</Text>
          <Text style={styles.pctText}>{pct}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, {width:`${pct}%`}]} />
        </View>
        <View style={styles.row}>
          <Text style={styles.progressEnd}>{lbsToStone(START_LBS)} start</Text>
          <Text style={styles.progressEnd}>{lbsToStone(GOAL_LBS)} goal</Text>
        </View>
      </View>

      {/* Chart */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>WEIGHT HISTORY</Text>
        {data.length < 2 ? (
          <Text style={styles.emptyChart}>Log at least 2 entries to see your chart</Text>
        ) : (
          <Svg width={chartW} height={chartH+20}>
            <Line x1={0} y1={gY} x2={chartW} y2={gY} stroke="#4ade8044" strokeWidth={1} strokeDasharray="4,4" />
            <SvgText x={chartW-2} y={gY-4} fontSize={9} fill="#4ade8088" textAnchor="end">Goal</SvgText>
            {pathD ? <Path d={pathD} fill="none" stroke={COLORS.blue} strokeWidth={2} strokeLinejoin="round" /> : null}
            {data.map((d,i)=>(
              <Circle key={i} cx={tx(i)} cy={ty(d.lbs)} r={i===data.length-1?4:3}
                fill={i===data.length-1?'#60a5fa':COLORS.blueDark} stroke={COLORS.blue} strokeWidth={1.5} />
            ))}
          </Svg>
        )}
        <View style={styles.row}>
          <Text style={styles.chartStat}>Best: <Text style={{color:COLORS.green,fontFamily:'Inter_700Bold'}}>{lbsToStone(lowest)}</Text></Text>
          <Text style={styles.chartStat}>Start: <Text style={{color:COLORS.muted}}>{lbsToStone(START_LBS)}</Text></Text>
        </View>
      </View>

      {/* Log weight — with unit toggle incl. metric */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>LOG TODAY'S WEIGHT</Text>
        <View style={styles.unitRow}>
          {['stone','lbs','kg'].map(u=>(
            <TouchableOpacity key={u} style={[styles.unitBtn, unit===u && styles.unitBtnActive]} onPress={()=>setUnit(u)}>
              <Text style={[styles.unitBtnText, unit===u && styles.unitBtnTextActive]}>{u}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {unit === 'stone' ? (
          <View style={styles.inputRow}>
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Stone</Text>
              <TextInput
                style={styles.input} value={stoneVal} onChangeText={v=>setStoneVal(v.replace(/[^0-9]/g,''))}
                placeholder="17" placeholderTextColor={COLORS.muted} keyboardType="numeric"
                maxLength={3} testID="weight-stone-input"
              />
            </View>
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Lbs (0–13)</Text>
              <TextInput
                style={styles.input} value={lbVal} onChangeText={v=>{const n=parseInt(v)||0; setLbVal(n>13?'13':v.replace(/[^0-9]/g,''));}}
                placeholder="8" placeholderTextColor={COLORS.muted} keyboardType="numeric"
                maxLength={2} testID="weight-lbs-input"
              />
            </View>
          </View>
        ) : (
          <TextInput
            style={[styles.input, {marginBottom:12}]}
            value={stoneVal}
            onChangeText={v=>setStoneVal(v.replace(/[^0-9.]/g,''))}
            placeholder={unit === 'kg' ? 'e.g. 115' : 'e.g. 248'}
            placeholderTextColor={COLORS.muted} keyboardType="numeric"
            maxLength={6} testID="weight-lbs-input"
          />
        )}
        <TouchableOpacity style={styles.logBtn} onPress={addWeight} testID="log-weight-btn">
          <Text style={styles.logBtnText}>+ Log weight</Text>
        </TouchableOpacity>
      </View>

      {/* Milestones */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>MILESTONES</Text>
        {MILESTONES.map(m=>{
          const reached = latest <= m.lbs;
          return (
            <View key={m.lbs} style={styles.milestoneRow}>
              <View style={[styles.milestoneDot, reached && styles.milestoneDotDone]}>
                {reached && <Text style={styles.milestoneTick}>✓</Text>}
              </View>
              <Text style={[styles.milestoneLabel, reached && styles.milestoneLabelDone]}>{m.label}</Text>
              {!reached && <Text style={styles.milestoneAway}>−{(latest-m.lbs).toFixed(0)} lbs</Text>}
            </View>
          );
        })}
      </View>

      {/* Entries list */}
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.cardLabel}>YOUR ENTRIES</Text>
          {weights.length > 0 && (
            <TouchableOpacity onPress={clearAll}>
              <Text style={styles.clearAllText}>Clear all</Text>
            </TouchableOpacity>
          )}
        </View>
        {weights.length === 0 ? (
          <Text style={styles.emptyChart}>No entries yet</Text>
        ) : (
          [...weights].reverse().map(w=>(
            <View key={w.date} style={styles.entryRow}>
              <View>
                <Text style={styles.entryDate}>{w.date}</Text>
                <Text style={styles.entryWeight}>{lbsToStone(w.lbs)}{unit==='kg'?` · ${lbsToKg(w.lbs)}`:''}</Text>
              </View>
              <TouchableOpacity style={styles.delBtn} onPress={()=>deleteWeight(w.date)}>
                <Text style={styles.delBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* Account */}
      <View style={styles.accountCard}>
        <Text style={styles.accountLabel}>ACCOUNT</Text>
        {!isPremium && (
          <TouchableOpacity style={styles.upgradeBtn} onPress={onUpgrade}>
            <Text style={styles.upgradeBtnText}>⭐ Upgrade to Premium</Text>
            <Text style={styles.upgradeBtnSub}>Unlock full 12-week plans from £3.99/mo</Text>
          </TouchableOpacity>
        )}
        {isPremium && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>⭐ Premium — all features unlocked</Text>
          </View>
        )}
        <TouchableOpacity style={styles.signOutBtn} onPress={async () => {
          const { signOut } = require('../utils/supabase');
          await signOut();
        }}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#080c14' },
  content: { padding:16, paddingBottom:40 },
  pageTitle: { fontSize:28, fontFamily:'Inter_700Bold', color:COLORS.text, marginBottom:16 },
  card: { backgroundColor:'#0f1520', borderRadius:12, padding:16, marginBottom:12, borderWidth:1, borderColor:COLORS.border },
  cardLabel: { fontFamily:'Inter_500Medium', fontSize:11, letterSpacing:0.5, color:COLORS.textMuted, marginBottom:8, textTransform:'uppercase' },
  row: { flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  statsGrid: { flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:12 },
  statCard: { flex:1, minWidth:'45%', backgroundColor:'#0f1520', borderRadius:12, padding:14, borderWidth:1, borderColor:COLORS.border },
  statCardLabel: { fontFamily:'Inter_500Medium', fontSize:11, letterSpacing:0.5, color:COLORS.textMuted, textTransform:'uppercase', marginBottom:4 },
  statCardVal: { fontSize:16, fontFamily:'Inter_700Bold' },
  progressTrack: { height:8, backgroundColor:'#080c14', borderRadius:4, overflow:'hidden', marginVertical:6 },
  progressFill: { height:8, borderRadius:4, backgroundColor:COLORS.green },
  progressEnd: { fontSize:10, color:COLORS.dim },
  pctText: { fontSize:14, fontFamily:'Inter_700Bold', color:COLORS.green },
  emptyChart: { fontSize:12, color:COLORS.dim, paddingVertical:12, textAlign:'center' },
  chartStat: { fontSize:11, color:COLORS.muted },
  unitRow: { flexDirection:'row', gap:8, marginBottom:12 },
  unitBtn: { flex:1, padding:10, borderRadius:8, borderWidth:1, borderColor:'#2a3d56', alignItems:'center', backgroundColor:'#080c14' },
  unitBtnActive: { borderColor:COLORS.blue, backgroundColor:COLORS.blueDark },
  unitBtnText: { color:COLORS.dim, fontSize:12 },
  unitBtnTextActive: { color:COLORS.blueLight },
  inputRow: { flexDirection:'row', gap:8, marginBottom:12 },
  inputWrap: { flex:1 },
  inputLabel: { fontFamily:'Inter_500Medium', fontSize:11, letterSpacing:0.3, color:COLORS.textMuted, marginBottom:4 },
  input: { backgroundColor:'#080c14', borderWidth:1, borderColor:'#2a3d56', borderRadius:8, color:COLORS.text, padding:12, fontSize:14 },
  logBtn: { backgroundColor:COLORS.blueDark, borderRadius:10, padding:14, alignItems:'center' },
  logBtnText: { color:COLORS.blueLight, fontSize:14, fontFamily:'Inter_700Bold' },
  milestoneRow: { flexDirection:'row', alignItems:'center', gap:12, marginTop:10 },
  milestoneDot: { width:20, height:20, borderRadius:10, backgroundColor:'#080c14', borderWidth:2, borderColor:'#2a3d56', alignItems:'center', justifyContent:'center' },
  milestoneDotDone: { backgroundColor:COLORS.greenDark, borderColor:COLORS.green },
  milestoneTick: { fontSize:10, color:'#fff' },
  milestoneLabel: { fontFamily:'Inter_400Regular', fontSize:13, color:COLORS.dim, flex:1 },
  milestoneLabelDone: { color:COLORS.green },
  milestoneAway: { fontSize:11, color:'#334155' },
  entryRow: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:10, borderBottomWidth:1, borderBottomColor:COLORS.border },
  entryDate: { fontSize:12, color:COLORS.muted },
  entryWeight: { fontSize:15, fontFamily:'Inter_600SemiBold', color:COLORS.text, marginTop:2 },
  delBtn: { borderWidth:1, borderColor:'#2a3d56', borderRadius:6, paddingHorizontal:10, paddingVertical:6 },
  delBtnText: { color:COLORS.dim, fontSize:12 },
  clearAllText: { fontSize:11, color:COLORS.red, borderWidth:1, borderColor:COLORS.redDark, borderRadius:6, paddingHorizontal:8, paddingVertical:3 },
  accountCard: { backgroundColor:'#0f1520', borderRadius:12, padding:16, marginTop:4, marginBottom:12, borderWidth:1, borderColor:'#1e2d42', gap:10 },
  accountLabel: { fontSize:10, letterSpacing:3, color:COLORS.muted, textTransform:'uppercase', marginBottom:4 },
  upgradeBtn: { backgroundColor:'#1a1035', borderRadius:10, padding:14, borderWidth:1, borderColor:COLORS.purple },
  upgradeBtnText: { fontSize:14, fontFamily:'Inter_700Bold', color:COLORS.purpleLight, marginBottom:3 },
  upgradeBtnSub: { fontSize:12, color:COLORS.muted },
  premiumBadge: { backgroundColor:COLORS.greenBg, borderRadius:10, padding:12, borderWidth:1, borderColor:COLORS.greenDark },
  premiumBadgeText: { fontFamily:'Inter_400Regular', fontSize:13, color:COLORS.green, fontFamily:'Inter_600SemiBold' },
  signOutBtn: { padding:12, alignItems:'center', borderWidth:1, borderColor:'#1e2d42', borderRadius:10 },
  signOutText: { color:COLORS.dim, fontSize:14 },
});
