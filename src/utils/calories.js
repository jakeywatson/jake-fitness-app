import { MET_VALUES, TDEE_MULTIPLIERS, SAFE_DEFICIT, LBS_PER_CALORIE_DEFICIT } from '../constants/config';

// ─── Calorie burn estimates ────────────────────────────────────────────────────

export function calcCaloriesBurned({ activityType, durationMins, weightKg }) {
  const met = MET_VALUES[activityType] || MET_VALUES.gym_strength;
  return Math.round(met * weightKg * (durationMins / 60));
}

export function estimateRunCalories({ durationMins, weightKg, intervalType = 'mixed' }) {
  // Mixed run/walk intervals use a blended MET
  const met = intervalType === 'walk' ? MET_VALUES.walk
    : intervalType === 'run' ? MET_VALUES.run_easy
    : (MET_VALUES.run_easy + MET_VALUES.walk) / 2;
  return Math.round(met * weightKg * (durationMins / 60));
}

export function estimateGymCalories({ durationMins, weightKg, phase = 1 }) {
  // Higher phases = more intensity
  const met = phase <= 2 ? MET_VALUES.gym_strength : MET_VALUES.gym_circuit;
  return Math.round(met * weightKg * (durationMins / 60));
}

export function estimateHiitCalories({ durationMins, weightKg }) {
  return Math.round(MET_VALUES.hiit * weightKg * (durationMins / 60));
}

// ─── TDEE + targets ────────────────────────────────────────────────────────────

export function calcTDEE({ weightKg, heightCm, ageYears, activityLevel = 'light' }) {
  // Mifflin-St Jeor equation (male)
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5;
  const multiplier = TDEE_MULTIPLIERS[activityLevel] || TDEE_MULTIPLIERS.light;
  return Math.round(bmr * multiplier);
}

export function calcDailyTarget({ tdee, deficitPerDay = SAFE_DEFICIT }) {
  return Math.max(1500, tdee - deficitPerDay); // never go below 1500
}

export function calcWeeklyDeficit({ exerciseCalories, tdee, actualCalories }) {
  const exerciseDeficit = exerciseCalories;
  const dietDeficit = actualCalories ? Math.max(0, tdee - actualCalories) * 7 : 0;
  return exerciseDeficit + dietDeficit;
}

export function estimateWeeksToGoal({ currentLbs, goalLbs, weeklyDeficit }) {
  if (weeklyDeficit <= 0) return null;
  const lbsToLose = currentLbs - goalLbs;
  const caloriesToLose = lbsToLose / LBS_PER_CALORIE_DEFICIT;
  return Math.ceil(caloriesToLose / weeklyDeficit);
}

// ─── Food equivalents (fun context) ───────────────────────────────────────────

export function calorieEquivalent(calories) {
  const items = [
    { name: 'Big Mac', cals: 550 },
    { name: 'slice of pizza', cals: 285 },
    { name: 'pint of beer', cals: 208 },
    { name: 'Mars bar', cals: 228 },
    { name: 'bag of crisps', cals: 130 },
    { name: 'glass of wine', cals: 160 },
    { name: 'chocolate biscuit', cals: 85 },
    { name: 'banana', cals: 90 },
  ];
  const match = items.reduce((prev, curr) =>
    Math.abs(curr.cals - calories) < Math.abs(prev.cals - calories) ? curr : prev
  );
  const count = Math.round(calories / match.cals * 10) / 10;
  return count === 1 ? `a ${match.name}` : `${count} ${match.name}s`;
}

// ─── Weight → kg conversion ────────────────────────────────────────────────────

export const lbsToKg = lbs => lbs * 0.453592;
export const kgToLbs = kg => kg / 0.453592;
export const lbsToStone = l => `${Math.floor(l/14)}st ${Math.round(l%14)}lb`;
