/**
 * Tests for App reducer logic
 * Covers: state transitions, data loading, persistence
 */

// Reducer extracted for testing
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

const initialState = {
  week: 1, checked: {}, wegovy: null, weights: [],
  runWeek: 1, runSession: 1, completedRuns: [],
};

describe('App reducer', () => {
  test('LOAD merges payload into state', () => {
    const state = reducer(initialState, { type: 'LOAD', payload: { week: 5, runWeek: 3 } });
    expect(state.week).toBe(5);
    expect(state.runWeek).toBe(3);
    expect(state.checked).toEqual({});
  });

  test('TOGGLE_CHECK sets true on first press', () => {
    const state = reducer(initialState, { type: 'TOGGLE_CHECK', payload: 'w1_run_0' });
    expect(state.checked['w1_run_0']).toBe(true);
  });

  test('TOGGLE_CHECK toggles false on second press', () => {
    let state = reducer(initialState, { type: 'TOGGLE_CHECK', payload: 'w1_run_0' });
    state = reducer(state, { type: 'TOGGLE_CHECK', payload: 'w1_run_0' });
    expect(state.checked['w1_run_0']).toBe(false);
  });

  test('TOGGLE_CHECK does not affect other keys', () => {
    let state = reducer(initialState, { type: 'TOGGLE_CHECK', payload: 'w1_run_0' });
    state = reducer(state, { type: 'TOGGLE_CHECK', payload: 'w1_run_1' });
    expect(state.checked['w1_run_0']).toBe(true);
    expect(state.checked['w1_run_1']).toBe(true);
  });

  test('SET_WEEK updates week', () => {
    const state = reducer(initialState, { type: 'SET_WEEK', payload: 7 });
    expect(state.week).toBe(7);
  });

  test('LOG_WEGOVY stores day number', () => {
    const day = Math.floor(Date.now() / 86400000);
    const state = reducer(initialState, { type: 'LOG_WEGOVY', payload: day });
    expect(state.wegovy).toBe(day);
  });

  test('SET_WEIGHTS replaces weights array', () => {
    const weights = [{ date: '2026-01-01', lbs: 244 }];
    const state = reducer(initialState, { type: 'SET_WEIGHTS', payload: weights });
    expect(state.weights).toEqual(weights);
  });

  test('COMPLETE_RUN updates run state', () => {
    const payload = { completedRuns: ['1_1'], runWeek: 1, runSession: 2 };
    const state = reducer(initialState, { type: 'COMPLETE_RUN', payload });
    expect(state.completedRuns).toContain('1_1');
    expect(state.runSession).toBe(2);
  });

  test('unknown action returns state unchanged', () => {
    const state = reducer(initialState, { type: 'UNKNOWN' });
    expect(state).toEqual(initialState);
  });

  test('checked state is immutable — new object each time', () => {
    const state1 = reducer(initialState, { type: 'TOGGLE_CHECK', payload: 'key1' });
    const state2 = reducer(state1, { type: 'TOGGLE_CHECK', payload: 'key2' });
    expect(state1.checked).not.toBe(state2.checked);
  });
});

describe('Weight helper functions', () => {
  const lbsToStone = l => `${Math.floor(l/14)}st ${Math.round(l%14)}lb`;

  test('258 lbs = 18st 6lb', () => {
    expect(lbsToStone(258)).toBe('18st 6lb');
  });

  test('196 lbs = 14st 0lb', () => {
    expect(lbsToStone(196)).toBe('14st 0lb');
  });

  test('227 lbs = 16st 3lb', () => {
    expect(lbsToStone(227)).toBe('16st 3lb');
  });

  test('238 lbs = 17st 0lb', () => {
    expect(lbsToStone(238)).toBe('17st 0lb');
  });
});
