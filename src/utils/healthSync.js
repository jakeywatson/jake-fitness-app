import { Platform } from 'react-native';

// Conditional import — expo-health-connect is Android only
let HealthConnect = null;
try {
  HealthConnect = require('react-native-health-connect');
} catch (e) {}

export async function initHealthConnect() {
  if (Platform.OS !== 'android' || !HealthConnect) return false;
  try {
    const available = await HealthConnect.isAvailableAsync();
    if (!available) return false;
    await HealthConnect.requestPermissionsAsync([
      { accessType: 'write', recordType: 'ExerciseSession' },
      { accessType: 'write', recordType: 'TotalCaloriesBurned' },
      { accessType: 'write', recordType: 'Steps' },
      { accessType: 'read',  recordType: 'Steps' },
      { accessType: 'read',  recordType: 'Weight' },
    ]);
    return true;
  } catch (e) {
    console.log('Health Connect init failed:', e.message);
    return false;
  }
}

export async function logWorkoutToHealth({ activityType, startTime, endTime, calories, title }) {
  if (Platform.OS !== 'android' || !HealthConnect) return false;
  try {
    const exerciseType = activityType === 'run' ? 'Running'
      : activityType === 'hiit' ? 'HighIntensityIntervalTraining'
      : 'WeightTraining';

    await HealthConnect.insertRecordsAsync([
      {
        recordType: 'ExerciseSession',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        exerciseType,
        title: title || 'Zero to Fit Workout',
      },
      {
        recordType: 'TotalCaloriesBurned',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        energy: { value: calories, unit: 'kilocalories' },
      },
    ]);
    return true;
  } catch (e) {
    console.log('Health Connect log failed:', e.message);
    return false;
  }
}

export async function logWeightToHealth(weightKg) {
  if (Platform.OS !== 'android' || !HealthConnect) return false;
  try {
    await HealthConnect.insertRecordsAsync([{
      recordType: 'Weight',
      time: new Date().toISOString(),
      weight: { value: weightKg, unit: 'kilograms' },
    }]);
    return true;
  } catch (e) { return false; }
}

export async function readStepsToday() {
  if (Platform.OS !== 'android' || !HealthConnect) return 0;
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const result = await HealthConnect.readRecordsAsync('Steps', {
      timeRangeFilter: { operator: 'between', startTime: startOfDay.toISOString(), endTime: now.toISOString() },
    });
    return result.records.reduce((sum, r) => sum + (r.count || 0), 0);
  } catch (e) { return 0; }
}
