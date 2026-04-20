import React, { useReducer, useEffect, useCallback, useState } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text, View, ActivityIndicator, StyleSheet, Modal } from 'react-native';

import { supabase, loadUserData, saveUserData } from './src/utils/supabase';
import { initPurchases, checkPremiumStatus } from './src/utils/purchases';
import { postActivity, makeDisplayName, savePushToken } from './src/utils/feed';
import { COLORS } from './src/constants/data';
import { FREE_RUN_WEEKS, FREE_GYM_EXERCISES, FREE_HIIT_WORKOUTS } from './src/constants/config';

import AuthScreen from './src/screens/AuthScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import PaywallScreen from './src/screens/PaywallScreen';
import RunScreen from './src/screens/RunScreen';
import WeightScreen from './src/screens/WeightScreen';
import GymScreen from './src/screens/GymScreen';
import HiitScreen from './src/screens/HiitScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import FeedScreen from './src/screens/FeedScreen';
import CaloriesScreen from './src/screens/CaloriesScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const initialState = {
  week: 1, checked: {}, wegovy: null, weights: [],
  runWeek: 1, runSession: 1, completedRuns: [],
  goalLbs: 196, trainingDays: 3, onboardingComplete: false,
  feedOptIn: false, area: null, fitnessLevel: 'beginner',
  aiPlan: null, calorieBurns: [], heightCm: 188, ageYears: 32,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD':          return { ...state, ...action.payload };
    case 'TOGGLE_CHECK':  return { ...state, checked: { ...state.checked, [action.payload]: !state.checked[action.payload] }};
    case 'SET_WEEK':      return { ...state, week: action.payload };
    case 'LOG_WEGOVY':    return { ...state, wegovy: action.payload };
    case 'SET_WEIGHTS':   return { ...state, weights: action.payload };
    case 'COMPLETE_RUN':  return { ...state, ...action.payload };
    case 'SET_GOAL':      return { ...state, goalLbs: action.payload };
    case 'FEED_OPT_IN':   return { ...state, feedOptIn: true };
    case 'SET_AI_PLAN':   return { ...state, aiPlan: action.payload };
    case 'LOG_CALORIE_BURN': return { ...state, calorieBurns: [...(state.calorieBurns||[]), action.payload].slice(-50) };
    case 'SET_PROFILE':   return { ...state, ...action.payload };
    default:              return state;
  }
}

const NavTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: COLORS.bg, card: COLORS.card, border: COLORS.border, text: COLORS.text },
};

export default function App() {
  const [appState, dispatch] = useReducer(reducer, initialState);
  const [bootstrapped, setBootstrapped] = useState(false);
  const [user, setUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    async function bootstrap() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) await onUserSignedIn(session.user);
      setBootstrapped(true);
    }
    bootstrap();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) onUserSignedIn(session.user);
      else { setUser(null); setIsPremium(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const onUserSignedIn = async (u) => {
    setUser(u);
    const data = await loadUserData(u.id);
    if (data) dispatch({ type: 'LOAD', payload: data });
    await initPurchases(u.id);
    const premium = await checkPremiumStatus();
    setIsPremium(premium);
  };

  useEffect(() => {
    if (!bootstrapped || !user) return;
    const timer = setTimeout(() => saveUserData(user.id, appState), 600);
    return () => clearTimeout(timer);
  }, [appState, bootstrapped, user]);

  const persistingDispatch = useCallback((action) => dispatch(action), []);

  // Post to activity feed when workout/run completed
  const postToFeed = useCallback(async (eventType, metadata) => {
    if (!user || !appState.feedOptIn) return;
    try {
      await postActivity({
        userId: user.id,
        displayName: makeDisplayName(user.email),
        area: appState.area,
        eventType,
        metadata,
        fitnessLevel: appState.fitnessLevel,
      });
    } catch (e) {}
  }, [user, appState.feedOptIn, appState.area, appState.fitnessLevel]);

  if (!bootstrapped) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingEmoji}>💪</Text>
        <ActivityIndicator color={COLORS.blue} style={{ marginTop: 16 }} />
      </View>
    );
  }

  if (!user) return <SafeAreaProvider><AuthScreen onAuth={onUserSignedIn} /></SafeAreaProvider>;

  if (!appState.onboardingComplete) {
    return (
      <SafeAreaProvider>
        <OnboardingScreen
          user={user}
          onComplete={(data) => { dispatch({ type: 'LOAD', payload: data }); setShowPaywall(true); }}
        />
      </SafeAreaProvider>
    );
  }

  if (showPaywall) {
    return (
      <SafeAreaProvider>
        <PaywallScreen
          onSubscribe={() => { setIsPremium(true); setShowPaywall(false); }}
          onContinueFree={() => setShowPaywall(false)}
          onRestore={() => { setIsPremium(true); setShowPaywall(false); }}
        />
      </SafeAreaProvider>
    );
  }

  const screenProps = { appState, dispatch: persistingDispatch, isPremium, onUpgrade: () => setShowPaywall(true), user, postToFeed };

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={NavTheme}>
        <Tab.Navigator
          screenOptions={{
            tabBarStyle: { backgroundColor: COLORS.card, borderTopColor: COLORS.border, height: 60, paddingBottom: 8 },
            tabBarActiveTintColor: COLORS.blueLight,
            tabBarInactiveTintColor: COLORS.dim,
            tabBarLabelStyle: { fontSize: 9, marginTop: -2 },
            headerShown: false,
          }}
        >
          <Tab.Screen name="Weight" options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>⚖️</Text> }}>
            {() => <WeightScreen {...screenProps} />}
          </Tab.Screen>
          <Tab.Screen name="Run" options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🏃</Text> }}>
            {() => <RunScreen {...screenProps} />}
          </Tab.Screen>
          <Tab.Screen name="Gym" options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>💪</Text> }}>
            {() => <GymScreen {...screenProps} />}
          </Tab.Screen>
          <Tab.Screen name="HIIT" options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🔥</Text> }}>
            {() => <HiitScreen {...screenProps} />}
          </Tab.Screen>
          <Tab.Screen name="Community" options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🌍</Text> }}>
            {() => (
              <CommunityScreen
                user={user}
                isPremium={isPremium}
                onUpgrade={() => setShowPaywall(true)}
                onPlayWorkout={(workout) => {
                  // Community workouts play via HiitScreen's player
                  // For now navigate to HIIT tab — full deep linking in next iteration
                }}
              />
            )}
          </Tab.Screen>
          <Tab.Screen name="Feed" options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>📣</Text> }}>
            {() => (
              <FeedScreen
                user={user}
                appState={appState}
                onOptIn={() => dispatch({ type: 'FEED_OPT_IN' })}
              />
            )}
          </Tab.Screen>
          <Tab.Screen name="Calories" options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🔢</Text> }}>
            {() => <CaloriesScreen {...screenProps} />}
          </Tab.Screen>
          <Tab.Screen name="Settings" options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>⚙️</Text> }}>
            {() => <SettingsScreen user={user} appState={appState} dispatch={persistingDispatch} isPremium={isPremium} onUpgrade={() => setShowPaywall(true)} />}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' },
  loadingEmoji: { fontSize: 48 },
});
