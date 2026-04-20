/**
 * Tests for constants/data.js
 * Verifies the core data structures that drive the whole app are correct
 */
import { RUN_WEEKS, GYM_EXERCISES, HIIT_WORKOUTS, HIIT_MOVES, MILESTONES, COLORS, START_LBS, GOAL_LBS } from '../src/constants/data';

describe('RUN_WEEKS', () => {
  test('has exactly 12 weeks', () => {
    expect(RUN_WEEKS).toHaveLength(12);
  });

  test('each week has required fields', () => {
    RUN_WEEKS.forEach((w, i) => {
      expect(w.week).toBe(i + 1);
      expect(w.intervals).toHaveLength(2);
      expect(w.intervals[0].type).toBe('run');
      expect(w.intervals[1].type).toBe('walk');
      expect(w.reps).toBeGreaterThan(0);
      expect(w.warmup).toBe(300);
      expect(w.cooldown).toBe(300);
    });
  });

  test('run intervals increase over time', () => {
    const runTimes = RUN_WEEKS.map(w => w.intervals[0].secs);
    for (let i = 1; i < runTimes.length; i++) {
      expect(runTimes[i]).toBeGreaterThanOrEqual(runTimes[i - 1]);
    }
  });

  test('walk intervals decrease over time', () => {
    const walkTimes = RUN_WEEKS.map(w => w.intervals[1].secs);
    for (let i = 1; i < walkTimes.length; i++) {
      expect(walkTimes[i]).toBeLessThanOrEqual(walkTimes[i - 1]);
    }
  });

  test('total session time is reasonable (15-45 mins)', () => {
    RUN_WEEKS.forEach(w => {
      const total = w.warmup + w.cooldown + (w.intervals[0].secs + w.intervals[1].secs) * w.reps;
      const mins = total / 60;
      expect(mins).toBeGreaterThan(15);
      expect(mins).toBeLessThan(45);
    });
  });
});

describe('GYM_EXERCISES', () => {
  test('has exactly 6 exercises', () => {
    expect(GYM_EXERCISES).toHaveLength(6);
  });

  test('each exercise has required fields', () => {
    GYM_EXERCISES.forEach(ex => {
      expect(ex.id).toBeTruthy();
      expect(ex.name).toBeTruthy();
      expect(ex.emoji).toBeTruthy();
      expect(ex.sets).toBeGreaterThan(0);
      expect(ex.how).toHaveLength(5);
      expect(ex.tip).toBeTruthy();
      expect(ex.startWeight).toBeGreaterThan(0);
      expect(ex.increment).toBeGreaterThan(0);
    });
  });

  test('weights increase every 3 weeks over 12 weeks', () => {
    GYM_EXERCISES.forEach(ex => {
      const week1 = ex.startWeight;
      const week4 = ex.startWeight + ex.increment;
      const week7 = ex.startWeight + ex.increment * 2;
      const week10 = ex.startWeight + ex.increment * 3;
      expect(week4).toBeGreaterThan(week1);
      expect(week7).toBeGreaterThan(week4);
      expect(week10).toBeGreaterThan(week7);
    });
  });

  test('no duplicate exercise IDs', () => {
    const ids = GYM_EXERCISES.map(e => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('HIIT_WORKOUTS', () => {
  test('has exactly 5 workouts', () => {
    expect(HIIT_WORKOUTS).toHaveLength(5);
  });

  test('all move IDs reference valid HIIT_MOVES', () => {
    const validIds = new Set(HIIT_MOVES.map(m => m.id));
    HIIT_WORKOUTS.forEach(wo => {
      wo.moves.forEach(id => {
        expect(validIds.has(id)).toBe(true);
      });
    });
  });

  test('work time is always longer than 0, rest longer than 0', () => {
    HIIT_WORKOUTS.forEach(wo => {
      expect(wo.work).toBeGreaterThan(0);
      expect(wo.rest).toBeGreaterThan(0);
      expect(wo.rounds).toBeGreaterThan(0);
    });
  });

  test('each workout is approximately 20-30 minutes', () => {
    HIIT_WORKOUTS.forEach(wo => {
      const totalSecs = (wo.work + wo.rest) * wo.moves.length * wo.rounds;
      const mins = totalSecs / 60;
      expect(mins).toBeGreaterThan(18);
      expect(mins).toBeLessThan(35);
    });
  });
});

describe('Weight goals', () => {
  test('goal is less than start', () => {
    expect(GOAL_LBS).toBeLessThan(START_LBS);
  });

  test('milestones are in descending order between start and goal', () => {
    for (let i = 1; i < MILESTONES.length; i++) {
      expect(MILESTONES[i].lbs).toBeLessThan(MILESTONES[i-1].lbs);
    }
  });

  test('all milestones are between goal and start', () => {
    MILESTONES.forEach(m => {
      expect(m.lbs).toBeGreaterThanOrEqual(GOAL_LBS);
      expect(m.lbs).toBeLessThanOrEqual(START_LBS);
      expect(m.label).toBeTruthy();
    });
  });
});

describe('COLORS', () => {
  test('all color values are valid hex strings', () => {
    Object.entries(COLORS).forEach(([key, val]) => {
      expect(val).toMatch(/^#[0-9a-fA-F]{3,8}$/);
    });
  });
});
