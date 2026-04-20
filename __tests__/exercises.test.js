import { EXERCISES, CATEGORIES, getExerciseById, getByCategory } from '../src/constants/exercises';

describe('Exercise library', () => {
  test('has 30 exercises', () => {
    expect(EXERCISES.length).toBeGreaterThanOrEqual(30);
  });

  test('all exercises have required fields', () => {
    EXERCISES.forEach(ex => {
      expect(ex.id).toBeTruthy();
      expect(ex.name).toBeTruthy();
      expect(ex.emoji).toBeTruthy();
      expect(ex.muscle).toBeTruthy();
      expect(ex.category).toBeTruthy();
      expect(ex.difficulty).toMatch(/^(beginner|intermediate|advanced)$/);
      expect(ex.how).toHaveLength(5);
      expect(ex.tip).toBeTruthy();
      expect(ex.cue).toBeTruthy();
      expect(ex.mod).toBeTruthy();
    });
  });

  test('no duplicate IDs', () => {
    const ids = EXERCISES.map(e => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('all categories represented', () => {
    const cats = new Set(EXERCISES.map(e => e.category));
    expect(cats.has('legs')).toBe(true);
    expect(cats.has('push')).toBe(true);
    expect(cats.has('pull')).toBe(true);
    expect(cats.has('core')).toBe(true);
    expect(cats.has('cardio')).toBe(true);
  });

  test('getExerciseById returns correct exercise', () => {
    const ex = getExerciseById('plank');
    expect(ex).toBeDefined();
    expect(ex.name).toBe('Plank');
    expect(ex.category).toBe('core');
  });

  test('getExerciseById returns undefined for unknown id', () => {
    expect(getExerciseById('nonexistent')).toBeUndefined();
  });

  test('getByCategory returns correct exercises', () => {
    const legs = getByCategory('legs');
    expect(legs.length).toBeGreaterThan(0);
    legs.forEach(e => expect(e.category).toBe('legs'));
  });

  test('weighted exercises have startWeight and increment', () => {
    EXERCISES.filter(e => e.weighted).forEach(ex => {
      expect(ex.startWeight).toBeGreaterThan(0);
      expect(ex.increment).toBeGreaterThan(0);
      expect(ex.unit).toBeTruthy();
    });
  });

  test('CATEGORIES array has correct structure', () => {
    expect(CATEGORIES.length).toBeGreaterThan(0);
    CATEGORIES.forEach(c => {
      expect(c.id).toBeTruthy();
      expect(c.label).toBeTruthy();
      expect(c.emoji).toBeTruthy();
    });
  });

  test('difficulty is always beginner or intermediate (no advanced yet)', () => {
    EXERCISES.forEach(ex => {
      expect(['beginner', 'intermediate']).toContain(ex.difficulty);
    });
  });
});
