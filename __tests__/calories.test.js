import {
  calcCaloriesBurned,
  estimateRunCalories,
  estimateGymCalories,
  estimateHiitCalories,
  calcTDEE,
  calcDailyTarget,
  estimateWeeksToGoal,
  calorieEquivalent,
  lbsToKg,
  kgToLbs,
  lbsToStone,
} from '../src/utils/calories';

describe('calorie burn estimates', () => {
  const weightKg = 100; // round number for easy checking

  test('calcCaloriesBurned uses MET × weight × duration', () => {
    // run_easy MET = 8.0, 60 min, 100kg → 800 kcal
    const result = calcCaloriesBurned({ activityType: 'run_easy', durationMins: 60, weightKg });
    expect(result).toBe(800);
  });

  test('calcCaloriesBurned falls back to gym_strength for unknown activity', () => {
    // gym_strength MET = 5.0, 60 min, 100kg → 500 kcal
    const result = calcCaloriesBurned({ activityType: 'unknown', durationMins: 60, weightKg });
    expect(result).toBe(500);
  });

  test('estimateRunCalories returns reasonable range for 30 min', () => {
    const result = estimateRunCalories({ durationMins: 30, weightKg });
    expect(result).toBeGreaterThan(150);
    expect(result).toBeLessThan(500);
  });

  test('estimateRunCalories: run intervals burn more than walk intervals', () => {
    const run = estimateRunCalories({ durationMins: 30, weightKg, intervalType: 'run' });
    const walk = estimateRunCalories({ durationMins: 30, weightKg, intervalType: 'walk' });
    expect(run).toBeGreaterThan(walk);
  });

  test('estimateGymCalories: higher phase burns more', () => {
    const phase1 = estimateGymCalories({ durationMins: 45, weightKg, phase: 1 });
    const phase3 = estimateGymCalories({ durationMins: 45, weightKg, phase: 3 });
    expect(phase3).toBeGreaterThan(phase1);
  });

  test('estimateHiitCalories returns reasonable range for 25 min', () => {
    const result = estimateHiitCalories({ durationMins: 25, weightKg });
    expect(result).toBeGreaterThan(200);
    expect(result).toBeLessThan(500);
  });

  test('heavier person burns more calories', () => {
    const light = calcCaloriesBurned({ activityType: 'run_easy', durationMins: 30, weightKg: 70 });
    const heavy = calcCaloriesBurned({ activityType: 'run_easy', durationMins: 30, weightKg: 120 });
    expect(heavy).toBeGreaterThan(light);
  });

  test('longer duration burns more calories', () => {
    const short = calcCaloriesBurned({ activityType: 'hiit', durationMins: 20, weightKg });
    const long  = calcCaloriesBurned({ activityType: 'hiit', durationMins: 40, weightKg });
    expect(long).toBeGreaterThan(short);
  });
});

describe('TDEE and daily targets', () => {
  const baseProfile = { weightKg: 100, heightCm: 180, ageYears: 35, activityLevel: 'light' };

  test('calcTDEE returns plausible value for average male', () => {
    const tdee = calcTDEE(baseProfile);
    expect(tdee).toBeGreaterThan(2000);
    expect(tdee).toBeLessThan(4000);
  });

  test('heavier person has higher TDEE', () => {
    const light = calcTDEE({ ...baseProfile, weightKg: 70 });
    const heavy = calcTDEE({ ...baseProfile, weightKg: 130 });
    expect(heavy).toBeGreaterThan(light);
  });

  test('more active person has higher TDEE', () => {
    const sedentary = calcTDEE({ ...baseProfile, activityLevel: 'sedentary' });
    const active    = calcTDEE({ ...baseProfile, activityLevel: 'active' });
    expect(active).toBeGreaterThan(sedentary);
  });

  test('calcDailyTarget is always below TDEE', () => {
    const tdee = calcTDEE(baseProfile);
    const target = calcDailyTarget({ tdee });
    expect(target).toBeLessThan(tdee);
  });

  test('calcDailyTarget never goes below 1500', () => {
    const target = calcDailyTarget({ tdee: 1400, deficitPerDay: 500 });
    expect(target).toBe(1500);
  });

  test('calcDailyTarget respects custom deficit', () => {
    const tdee = 2500;
    const target = calcDailyTarget({ tdee, deficitPerDay: 300 });
    expect(target).toBe(2200);
  });
});

describe('estimateWeeksToGoal', () => {
  test('returns null when weeklyDeficit is 0', () => {
    expect(estimateWeeksToGoal({ currentLbs: 250, goalLbs: 200, weeklyDeficit: 0 })).toBeNull();
  });

  test('returns null when weeklyDeficit is negative', () => {
    expect(estimateWeeksToGoal({ currentLbs: 250, goalLbs: 200, weeklyDeficit: -100 })).toBeNull();
  });

  test('returns a positive number of weeks', () => {
    const weeks = estimateWeeksToGoal({ currentLbs: 250, goalLbs: 200, weeklyDeficit: 3500 });
    expect(weeks).toBeGreaterThan(0);
  });

  test('more deficit = fewer weeks', () => {
    const slow = estimateWeeksToGoal({ currentLbs: 250, goalLbs: 200, weeklyDeficit: 1750 });
    const fast = estimateWeeksToGoal({ currentLbs: 250, goalLbs: 200, weeklyDeficit: 3500 });
    expect(fast).toBeLessThan(slow);
  });

  test('less to lose = fewer weeks', () => {
    const big  = estimateWeeksToGoal({ currentLbs: 280, goalLbs: 200, weeklyDeficit: 3500 });
    const small = estimateWeeksToGoal({ currentLbs: 220, goalLbs: 200, weeklyDeficit: 3500 });
    expect(small).toBeLessThan(big);
  });
});

describe('calorieEquivalent', () => {
  test('returns a non-empty string', () => {
    const result = calorieEquivalent(300);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  test('works for very small calorie counts', () => {
    const result = calorieEquivalent(50);
    expect(result).toBeTruthy();
  });

  test('works for large calorie counts', () => {
    const result = calorieEquivalent(1200);
    expect(result).toBeTruthy();
  });
});

describe('unit conversions', () => {
  test('lbsToKg: 252 lbs ≈ 114.3 kg', () => {
    expect(lbsToKg(252)).toBeCloseTo(114.3, 1);
  });

  test('kgToLbs: 100 kg ≈ 220.5 lbs', () => {
    expect(kgToLbs(100)).toBeCloseTo(220.5, 0);
  });

  test('lbsToKg and kgToLbs are inverse operations', () => {
    expect(kgToLbs(lbsToKg(200))).toBeCloseTo(200, 5);
  });

  test('lbsToStone: 196 lbs = 14st 0lb', () => {
    expect(lbsToStone(196)).toBe('14st 0lb');
  });

  test('lbsToStone: 258 lbs = 18st 6lb', () => {
    expect(lbsToStone(258)).toBe('18st 6lb');
  });
});
