import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import * as Speech from 'expo-speech';
import * as KeepAwake from 'expo-keep-awake';
import { COLORS, HIIT_MOVES, HIIT_WORKOUTS } from '../constants/data';

const fmt = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

function buildSeq(wo) {
  const mo = wo.moves.map(id=>HIIT_MOVES.find(m=>m.id===id));
  const seq = [{type:'warmup',dur:10,move:null}];
  for(let r=0;r<wo.rounds;r++) {
    for(let m=0;m<mo.length;m++) {
      seq.push({type:'work',dur:wo.work,move:mo[m],round:r+1,mi:m});
      if(!(r===wo.rounds-1&&m===mo.length-1))
        seq.push({type:'rest',dur:wo.rest,move:null,nextMove:m<mo.length-1?mo[m+1]:mo[0],round:r+1});
    }
  }
  seq.push({type:'done',dur:0,move:null});
  return seq;
}

function PlayerScreen({ workout, onComplete, onExit }) {
  const seq = buildSeq(workout);
  const [idx, setIdx] = useState(0);
  const [tLeft, setTLeft] = useState(seq[0].dur);
  const [running, setRunning] = useState(false);
  const [showMod, setShowMod] = useState(false);
  const timerRef = useRef(null);
  const step = seq[idx];

  const speak = useCallback(text => { Speech.stop().catch(()=>{}).finally(()=>{ Speech.speak(text, {language:'en-GB',rate:0.9}); }); },[]);

  useEffect(()=>{ KeepAwake.activateKeepAwakeAsync(); return()=>KeepAwake.deactivateKeepAwake(); },[]);

  const advance = useCallback((currentIdx)=>{
    const next=currentIdx+1;
    if(next>=seq.length){ setRunning(false); return; }
    const s=seq[next];
    setIdx(next); setTLeft(s.dur); setShowMod(false);
    if(s.type==='work') speak(`${s.move.name}`);
    else if(s.type==='rest') speak('Rest');
    else if(s.type==='done') speak('Well done Jake! Workout complete!');
  },[seq,speak]);

  const toggle = ()=>{
    if(!running){
      setRunning(true);
      if(step.type==='warmup') speak(`Starting ${workout.name}. ${workout.sub}. Get ready!`);
      timerRef.current=setInterval(()=>{
        setTLeft(t=>{
          if(t<=1){ setIdx(i=>{ advance(i); return i; }); return 0; }
          if(t===4){ setIdx(i=>{ const n=seq[i+1]; if(n?.type==='work') speak('Get ready'); return i; }); }
          return t-1;
        });
      },1000);
    } else {
      setRunning(false); clearInterval(timerRef.current); speak('Paused');
    }
  };

  const skip=()=>{ clearInterval(timerRef.current); setRunning(false); advance(idx); };

  const doneWork=seq.slice(0,idx).filter(s=>s.type==='work').length;
  const pct=Math.round((doneWork/(workout.rounds*workout.moves.length))*100);
  const accent=step.type==='work'&&step.move?step.move.color:step.type==='rest'?COLORS.blue:COLORS.green;

  return (
    <View style={[styles.player,{backgroundColor:step.type==='work'?'#0c1a0c':step.type==='rest'?'#0a1628':step.type==='done'?'#0d2018':COLORS.bg}]}>
      <View style={styles.playerTop}>
        <View><Text style={styles.playerTopName}>{workout.name}</Text><Text style={styles.playerTopSub}>{workout.sub}</Text></View>
        <TouchableOpacity style={styles.exitBtn} onPress={()=>{clearInterval(timerRef.current);Speech.stop().catch(()=>{});onExit();}}>
          <Text style={styles.exitBtnText}>✕ Exit</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.progressTrack}><View style={[styles.progressFill,{width:`${pct}%`,backgroundColor:accent}]}/></View>
      {!['done','warmup'].includes(step.type)&&(
        <View style={styles.roundDots}>
          {Array.from({length:workout.rounds},(_,i)=>(
            <View key={i} style={[styles.roundDot,{backgroundColor:i<(step.round||1)-1?COLORS.green:i===(step.round||1)-1?accent:COLORS.border}]}/>
          ))}
        </View>
      )}
      <View style={styles.playerBody}>
        {step.type==='done'&&(
          <View style={styles.centered}>
            <Text style={{fontSize:64,marginBottom:12}}>🎉</Text>
            <Text style={styles.doneTitle}>Workout done!</Text>
            <Text style={styles.doneSub}>{workout.rounds} rounds · {workout.moves.length} moves</Text>
            <TouchableOpacity style={styles.completeBtn} onPress={onComplete}><Text style={styles.completeBtnText}>✓ Mark complete</Text></TouchableOpacity>
          </View>
        )}
        {step.type==='warmup'&&(
          <View style={styles.centered}>
            <Text style={{fontSize:48,marginBottom:12}}>🔥</Text>
            <Text style={styles.warmupTitle}>Get ready!</Text>
            <Text style={styles.warmupSub}>First up: {seq[1]?.move?.emoji} {seq[1]?.move?.name}</Text>
          </View>
        )}
        {step.type==='rest'&&step.nextMove&&(
          <View style={{width:'100%'}}>
            <Text style={styles.restLabel}>REST</Text>
            <View style={styles.nextCard}>
              <Text style={{fontSize:36,marginBottom:8}}>{step.nextMove.emoji}</Text>
              <Text style={styles.nextName}>{step.nextMove.name}</Text>
              <Text style={styles.nextVisual}>{step.nextMove.visual}</Text>
            </View>
          </View>
        )}
        {step.type==='work'&&step.move&&(
          <View style={{width:'100%',alignItems:'center'}}>
            <Text style={styles.roundInfo}>Round {step.round} of {workout.rounds} · Move {step.mi+1} of {workout.moves.length}</Text>
            <Text style={{fontSize:68,marginBottom:8}}>{step.move.emoji}</Text>
            <Text style={[styles.moveName,{color:step.move.color}]}>{step.move.name}</Text>
            <View style={[styles.visualCard,{borderColor:step.move.color+'44'}]}>
              <Text style={[styles.visualCardLabel,{color:step.move.color}]}>WHAT YOU'RE DOING</Text>
              <Text style={styles.visualText}>{step.move.visual}</Text>
            </View>
            <Text style={styles.cueText}>"{step.move.cue}"</Text>
            <TouchableOpacity style={styles.modBtn} onPress={()=>setShowMod(s=>!s)}>
              <Text style={styles.modBtnText}>{showMod?'▲ Hide':'▼ Too hard? See mod'}</Text>
            </TouchableOpacity>
            {showMod&&(
              <View style={styles.modCard}>
                <Text style={styles.modLabel}>BEGINNER MOD</Text>
                <Text style={styles.modText}>{step.move.mod}</Text>
              </View>
            )}
          </View>
        )}
      </View>
      {step.type!=='done'&&(
        <View style={styles.playerBottom}>
          <View style={styles.timerWrap}>
            <Text style={[styles.bigTimer,{color:step.type==='work'?accent:COLORS.green}]}>{String(tLeft).padStart(2,'0')}</Text>
            <Text style={styles.timerLabel}>{step.type==='work'?'seconds work':step.type==='rest'?'seconds rest':'seconds'}</Text>
          </View>
          <View style={styles.controlRow}>
            <TouchableOpacity style={[styles.playBtn,{backgroundColor:running?COLORS.redDark:step.type==='work'?accent:COLORS.blueDark,flex:2}]} onPress={toggle}>
              <Text style={styles.playBtnText}>{running?'⏸  Pause':'▶  Start'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.skipBtn,{flex:1}]} onPress={skip}>
              <Text style={styles.skipBtnText}>Skip →</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

export default function HiitScreen({ appState, dispatch }) {
  const { week=1, checked={} } = appState;
  const [activePlayer, setActivePlayer] = useState(null);

  if (activePlayer) {
    const wo = HIIT_WORKOUTS.find(w=>w.id===activePlayer);
    const key = `w${week}_hiit_${HIIT_WORKOUTS.findIndex(w=>w.id===activePlayer)}`;
    return (
      <PlayerScreen
        workout={wo}
        onComplete={()=>{ dispatch({type:'TOGGLE_CHECK',payload:key}); setActivePlayer(null); }}
        onExit={()=>setActivePlayer(null)}
      />
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>HIIT</Text>
      <View style={styles.introCard}>
        <Text style={styles.introLabel}>BODY COACH STYLE</Text>
        <Text style={styles.introText}>5 workouts, each ~25 min. Tap ▶ Play for a guided session with live timer and audio cues.</Text>
      </View>
      {HIIT_WORKOUTS.map((wo,i)=>{
        const key=`w${week}_hiit_${i}`;
        const done=!!checked[key];
        const moves=wo.moves.map(id=>HIIT_MOVES.find(m=>m.id===id));
        const totalMins=Math.round((wo.work+wo.rest)*wo.moves.length*wo.rounds/60);
        return (
          <View key={wo.id} style={[styles.woCard, done&&styles.woCardDone]}>
            <View style={styles.woHeader}>
              <View style={{flex:1}}>
                <Text style={[styles.woName,done&&styles.woNameDone]}>{wo.name}: {wo.sub}</Text>
                <Text style={styles.woMeta}>{wo.moves.length} moves · {wo.rounds} rounds · {wo.work}s/{wo.rest}s · ~{totalMins} min</Text>
              </View>
              {done&&<Text style={{fontSize:18}}>✅</Text>}
            </View>
            <View style={styles.pills}>
              {moves.map(m=>(
                <View key={m.id} style={[styles.pill,{borderColor:m.color+'44'}]}>
                  <Text style={{fontSize:12}}>{m.emoji}</Text>
                  <Text style={styles.pillText}>{m.name}</Text>
                </View>
              ))}
            </View>
            <View style={styles.woBtns}>
              <TouchableOpacity style={[styles.playWorkoutBtn,done&&styles.playWorkoutBtnDone]} onPress={()=>setActivePlayer(wo.id)}>
                <Text style={styles.playWorkoutBtnText}>{done?'▶ Do again':'▶ Play workout'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.logOnlyBtn} onPress={()=>dispatch({type:'TOGGLE_CHECK',payload:key})}>
                <Text style={[styles.logOnlyText,done&&{color:COLORS.green}]}>{done?'✓ Done':'Log only'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:COLORS.bg},
  content:{padding:16,paddingBottom:40},
  pageTitle:{fontSize:28,fontWeight:'700',color:COLORS.text,marginBottom:16},
  introCard:{backgroundColor:'#1a0f00',borderRadius:12,padding:14,marginBottom:12,borderWidth:1,borderColor:'#7c2d12'},
  introLabel:{fontSize:10,color:COLORS.orange,letterSpacing:2,marginBottom:4},
  introText:{fontSize:12,color:COLORS.muted,lineHeight:18},
  woCard:{backgroundColor:COLORS.card,borderRadius:12,padding:14,marginBottom:10,borderWidth:1,borderColor:COLORS.border},
  woCardDone:{backgroundColor:COLORS.greenBg,borderColor:COLORS.greenDark},
  woHeader:{flexDirection:'row',alignItems:'flex-start',marginBottom:8},
  woName:{fontSize:14,fontWeight:'700',color:COLORS.text},
  woNameDone:{color:COLORS.green},
  woMeta:{fontSize:11,color:COLORS.muted,marginTop:3},
  pills:{flexDirection:'row',flexWrap:'wrap',gap:6,marginBottom:10},
  pill:{flexDirection:'row',alignItems:'center',gap:4,backgroundColor:COLORS.bg,borderRadius:8,paddingHorizontal:8,paddingVertical:4,borderWidth:1,borderColor:COLORS.border},
  pillText:{fontSize:10,color:COLORS.muted},
  woBtns:{flexDirection:'row',gap:8},
  playWorkoutBtn:{flex:2,padding:12,borderRadius:10,backgroundColor:COLORS.orange,alignItems:'center'},
  playWorkoutBtnDone:{backgroundColor:'#14532d'},
  playWorkoutBtnText:{color:'#fff',fontSize:13,fontWeight:'700'},
  logOnlyBtn:{flex:1,padding:12,borderRadius:10,borderWidth:1,borderColor:COLORS.border2,alignItems:'center'},
  logOnlyText:{color:COLORS.dim,fontSize:12},
  player:{flex:1},
  playerTop:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:20,borderBottomWidth:1,borderBottomColor:COLORS.border},
  playerTopName:{fontSize:13,color:COLORS.muted,letterSpacing:1},
  playerTopSub:{fontSize:11,color:COLORS.dim,marginTop:2},
  exitBtn:{backgroundColor:COLORS.card,borderRadius:8,paddingHorizontal:12,paddingVertical:8},
  exitBtnText:{color:COLORS.muted,fontSize:12},
  progressTrack:{height:4,backgroundColor:COLORS.border},
  progressFill:{height:4},
  roundDots:{flexDirection:'row',padding:10,paddingHorizontal:20,gap:6},
  roundDot:{flex:1,height:4,borderRadius:2},
  playerBody:{flex:1,alignItems:'center',justifyContent:'center',padding:20,gap:12},
  centered:{alignItems:'center'},
  doneTitle:{fontSize:26,fontWeight:'700',color:COLORS.green,marginBottom:8},
  doneSub:{fontSize:14,color:COLORS.muted,marginBottom:24},
  completeBtn:{backgroundColor:COLORS.greenDark,borderRadius:12,paddingHorizontal:32,paddingVertical:14},
  completeBtnText:{color:'#fff',fontSize:15,fontWeight:'700'},
  warmupTitle:{fontSize:22,fontWeight:'700',color:COLORS.text,marginBottom:8},
  warmupSub:{fontSize:16,color:COLORS.blueLight,fontWeight:'700'},
  restLabel:{fontSize:13,color:COLORS.blue,letterSpacing:3,textTransform:'uppercase',textAlign:'center',marginBottom:14},
  nextCard:{backgroundColor:COLORS.card,borderRadius:12,padding:16,borderWidth:1,borderColor:COLORS.blueDark,alignItems:'center',width:'100%'},
  nextName:{fontSize:18,fontWeight:'700',color:COLORS.blueLight,marginBottom:8},
  nextVisual:{fontSize:12,color:COLORS.muted,lineHeight:18,textAlign:'center'},
  roundInfo:{fontSize:11,color:COLORS.muted,letterSpacing:2,textTransform:'uppercase',marginBottom:10},
  moveName:{fontSize:22,fontWeight:'700',marginBottom:10},
  visualCard:{backgroundColor:COLORS.card,borderRadius:12,padding:14,marginBottom:8,borderWidth:1,width:'100%'},
  visualCardLabel:{fontSize:10,letterSpacing:2,marginBottom:5},
  visualText:{fontSize:12,color:COLORS.text,lineHeight:18},
  cueText:{fontSize:11,color:COLORS.muted,fontStyle:'italic',marginBottom:8},
  modBtn:{borderWidth:1,borderColor:COLORS.border2,borderRadius:8,paddingHorizontal:14,paddingVertical:6},
  modBtnText:{color:COLORS.dim,fontSize:11},
  modCard:{backgroundColor:'#1a1035',borderRadius:10,padding:12,borderWidth:1,borderColor:COLORS.purple,marginTop:8,width:'100%'},
  modLabel:{fontSize:10,color:COLORS.purple,letterSpacing:2,marginBottom:4},
  modText:{fontSize:12,color:COLORS.purpleLight,lineHeight:18},
  playerBottom:{padding:20,paddingBottom:36,borderTopWidth:1,borderTopColor:COLORS.border},
  timerWrap:{alignItems:'center',marginBottom:16},
  bigTimer:{fontSize:80,fontWeight:'700',lineHeight:80},
  timerLabel:{fontSize:11,color:COLORS.muted,letterSpacing:2,textTransform:'uppercase',marginTop:4},
  controlRow:{flexDirection:'row',gap:10},
  playBtn:{padding:18,borderRadius:12,alignItems:'center'},
  playBtnText:{color:'#fff',fontSize:16,fontWeight:'700'},
  skipBtn:{padding:18,borderRadius:12,borderWidth:1,borderColor:COLORS.border2,alignItems:'center'},
  skipBtnText:{color:COLORS.muted,fontSize:13},
});
