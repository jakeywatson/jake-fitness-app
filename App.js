import React, { useReducer, useEffect, useCallback } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { loadData, saveData } from './src/utils/storage';
import { COLORS } from './src/constants/data';
import RunScreen from './src/screens/RunScreen';
import WeightScreen from './src/screens/WeightScreen';
import GymScreen from './src/screens/GymScreen';
import HiitScreen from './src/screens/HiitScreen';

const Tab = createBottomTabNavigator();

const initialState = {
  week: 1,
  checked: {},
  wegovy: null,
  weights: [],
  runWeek: 1,
  runSession: 1,
  completedRuns: [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD': return { ...state, ...action.payload };
    case 'TOGGLE_CHECK': return { ...state, checked: { ...state.checked, [action.payload]: !state.checked[action.payload] }};
    case 'SET_WEEK': return { ...state, week: action.payload };
    case 'LOG_WEGOVY': return { ...state, wegovy: action.payload };
    case 'SET_WEIGHTS': return { ...state, weights: action.payload };
    case 'COMPLETE_RUN': return { ...state, ...action.payload };
    default: return state;
  }
}

const NavTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: COLORS.bg, card: COLORS.card, border: COLORS.border, text: COLORS.text },
};

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [loaded, setLoaded] = React.useState(false);

  useEffect(() => {
    loadData().then(data => {
      if (data) dispatch({ type: 'LOAD', payload: data });
      setLoaded(true);
    });
  }, []);

  const persistingDispatch = useCallback((action) => {
    dispatch(action);
    // debounced save
    setTimeout(() => {}, 0);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const timer = setTimeout(() => saveData(state), 500);
    return () => clearTimeout(timer);
  }, [state, loaded]);

  if (!loaded) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingEmoji}>💪</Text>
        <ActivityIndicator color={COLORS.blue} style={{ marginTop: 16 }} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const screenProps = { appState: state, dispatch: persistingDispatch };

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
          <Tab.Screen name="Weight" options={{ tabBarIcon: ({color}) => <Text style={{fontSize:20,color}}>⚖️</Text> }}>
            {() => <WeightScreen {...screenProps} />}
          </Tab.Screen>
          <Tab.Screen name="Run" options={{ tabBarIcon: ({color}) => <Text style={{fontSize:20,color}}>🏃</Text> }}>
            {() => <RunScreen {...screenProps} />}
          </Tab.Screen>
          <Tab.Screen name="Gym" options={{ tabBarIcon: ({color}) => <Text style={{fontSize:20,color}}>💪</Text> }}>
            {() => <GymScreen {...screenProps} />}
          </Tab.Screen>
          <Tab.Screen name="HIIT" options={{ tabBarIcon: ({color}) => <Text style={{fontSize:20,color}}>🔥</Text> }}>
            {() => <HiitScreen {...screenProps} />}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex:1, backgroundColor:COLORS.bg, alignItems:'center', justifyContent:'center' },
  loadingEmoji: { fontSize:48 },
  loadingText: { color:COLORS.muted, fontSize:13, marginTop:8, fontFamily:'monospace' },
});
