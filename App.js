import React, { useReducer, useEffect, useCallback, useState } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';

import { supabase, loadUserData, saveUserData } from './src/utils/supabase';
import { initPurchases, checkPremiumStatus } from './src/utils/purchases';
import { COLORS } from './src/constants/data';
import { FREE_RUN_WEEKS, FREE_GYM_EXERCISES, FREE_HIIT_WORKOUTS } from './src/constants/config';

import AuthScreen from './src/screens/AuthScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import PaywallScreen from './src/screens/PaywallScreen';
import RunScreen from './src/screens/RunScreen';
import WeightScreen from './src/screens/WeightScreen';
import GymScreen from './src/screens/GymScreen';
import HiitScreen from './src/screens/HiitScreen';

const Tab = createBottomTabNavigator();

// ─── App state reducer ────────────────────────────────────────────────────────
const initialState = {
  week: 1, checked: {}, wegovy: null, weights: [],
  runWeek: 1, runSession: 1, completedRuns: [],
  goalLbs: 196, trainingDays: 3, onboardingComplete: false,
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
    default:              return state;
  }
}

const NavTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: COLORS.bg, card: COLORS.card, border: COLORS.border, text: COLORS.text },
};

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [appState, dispatch] = useReducer(reducer, initialState);
  const [bootstrapped, setBootstrapped] = useState(false);
  const [user, setUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  // Bootstrap: check session, load data, check premium status
  useEffect(() => {
    async function bootstrap() {
      // Get existing session
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await onUserSignedIn(session.user);
      }
      setBootstrapped(true);
    }
    bootstrap();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) onUserSignedIn(session.user);
      else { setUser(null); setIsPremium(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const onUserSignedIn = async (u) => {
    setUser(u);
    // Load their data
    const data = await loadUserData(u.id);
    if (data) dispatch({ type: 'LOAD', payload: data });
    // Init RevenueCat + check premium
    await initPurchases(u.id);
    const premium = await checkPremiumStatus();
    setIsPremium(premium);
  };

  // Persist state to Supabase whenever it changes (debounced)
  useEffect(() => {
    if (!bootstrapped || !user) return;
    const timer = setTimeout(() => saveUserData(user.id, appState), 600);
    return () => clearTimeout(timer);
  }, [appState, bootstrapped, user]);

  // Dispatch wrapper that auto-saves
  const persistingDispatch = useCallback((action) => {
    dispatch(action);
  }, []);

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (!bootstrapped) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingEmoji}>💪</Text>
        <ActivityIndicator color={COLORS.blue} style={{ marginTop: 16 }} />
      </View>
    );
  }

  // ─── Not signed in ─────────────────────────────────────────────────────────
  if (!user) {
    return (
      <SafeAreaProvider>
        <AuthScreen onAuth={(u) => onUserSignedIn(u)} />
      </SafeAreaProvider>
    );
  }

  // ─── Onboarding ────────────────────────────────────────────────────────────
  if (!appState.onboardingComplete) {
    return (
      <SafeAreaProvider>
        <OnboardingScreen
          user={user}
          onComplete={(initialData) => {
            dispatch({ type: 'LOAD', payload: initialData });
            // Show paywall after onboarding
            setShowPaywall(true);
          }}
        />
      </SafeAreaProvider>
    );
  }

  // ─── Paywall (shown once after onboarding) ─────────────────────────────────
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

  // ─── Main app ──────────────────────────────────────────────────────────────
  const screenProps = {
    appState: { ...appState, isPremium },
    dispatch: persistingDispatch,
    isPremium,
    onUpgrade: () => setShowPaywall(true),
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={NavTheme}>
        <Tab.Navigator
          screenOptions={{
            tabBarStyle: { backgroundColor: COLORS.card, borderTopColor: COLORS.border, height: 60, paddingBottom: 8 },
            tabBarActiveTintColor: COLORS.blueLight,
            tabBarInactiveTintColor: COLORS.dim,
            tabBarLabelStyle: { fontSize: 10, marginTop: -2 },
            headerShown: false,
          }}
        >
          <Tab.Screen name="Weight" options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>⚖️</Text> }}>
            {() => <WeightScreen {...screenProps} />}
          </Tab.Screen>
          <Tab.Screen name="Run" options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🏃</Text> }}>
            {() => <RunScreen {...screenProps} />}
          </Tab.Screen>
          <Tab.Screen name="Gym" options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>💪</Text> }}>
            {() => <GymScreen {...screenProps} />}
          </Tab.Screen>
          <Tab.Screen name="HIIT" options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🔥</Text> }}>
            {() => <HiitScreen {...screenProps} />}
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
