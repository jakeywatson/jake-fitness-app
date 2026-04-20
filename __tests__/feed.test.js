import { formatFeedEvent, makeDisplayName } from '../src/utils/feed';

describe('formatFeedEvent', () => {
  const base = { display_name: 'Jake W', area: 'SE1', created_at: new Date().toISOString(), clap_count: 0 };

  test('formats run_complete event correctly', () => {
    const event = { ...base, event_type: 'run_complete', metadata: { week: 3, session: 2, duration: '28:14' } };
    const result = formatFeedEvent(event);
    expect(result.text).toContain('Jake W');
    expect(result.text).toContain('SE1');
    expect(result.text).toContain('Week 3');
    expect(result.text).toContain('Session 2');
    expect(result.emoji).toBe('🏃');
  });

  test('formats workout_complete event correctly', () => {
    const event = { ...base, event_type: 'workout_complete', metadata: { workout_name: 'Push Day', duration: '35:00' } };
    const result = formatFeedEvent(event);
    expect(result.text).toContain('Jake W');
    expect(result.text).toContain('Push Day');
    expect(result.emoji).toBe('💪');
  });

  test('formats routine_shared event correctly', () => {
    const event = { ...base, event_type: 'routine_shared', metadata: { name: 'Hotel Room Workout', fitness_level: 'beginner' } };
    const result = formatFeedEvent(event);
    expect(result.text).toContain('Hotel Room Workout');
    expect(result.emoji).toBe('📋');
  });

  test('formats run_streak event correctly', () => {
    const event = { ...base, event_type: 'run_streak', metadata: { streak: 5 } };
    const result = formatFeedEvent(event);
    expect(result.text).toContain('5');
    expect(result.emoji).toBe('🔥');
  });

  test('handles unknown event type gracefully', () => {
    const event = { ...base, event_type: 'unknown_type', metadata: {} };
    const result = formatFeedEvent(event);
    expect(result.text).toBeTruthy();
    expect(result.emoji).toBeTruthy();
  });

  test('shows location when area provided', () => {
    const event = { ...base, area: 'Manchester', event_type: 'run_complete', metadata: { week: 1, session: 1 } };
    const result = formatFeedEvent(event);
    expect(result.text).toContain('Manchester');
  });

  test('omits location when no area', () => {
    const event = { ...base, area: null, event_type: 'run_complete', metadata: { week: 1, session: 1 } };
    const result = formatFeedEvent(event);
    expect(result.text).not.toContain('in null');
  });

  test('always returns color', () => {
    const event = { ...base, event_type: 'run_complete', metadata: { week: 1, session: 1 } };
    const result = formatFeedEvent(event);
    expect(result.color).toMatch(/^#[0-9a-f]{6}$/i);
  });
});

describe('makeDisplayName', () => {
  test('formats firstname.lastname email', () => {
    expect(makeDisplayName('jake.watson@gmail.com')).toBe('Jake W.');
  });

  test('formats firstname_lastname email', () => {
    expect(makeDisplayName('jake_watson@gmail.com')).toBe('Jake W.');
  });

  test('formats single name email', () => {
    expect(makeDisplayName('jake@gmail.com')).toBe('Jake');
  });

  test('capitalises first letter', () => {
    expect(makeDisplayName('anna.smith@test.com')).toBe('Anna S.');
  });

  test('handles all lowercase', () => {
    const result = makeDisplayName('john.doe@test.com');
    expect(result).toBe('John D.');
  });

  test('handles hyphenated name', () => {
    const result = makeDisplayName('sarah-jane@test.com');
    expect(result).toBe('Sarah J.');
  });
});
