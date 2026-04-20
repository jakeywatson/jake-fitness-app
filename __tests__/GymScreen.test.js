/**
 * Tests for GymScreen component
 * Covers: exercise display, set logging, weight progression, phase labels
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import GymScreen from '../src/screens/GymScreen';
import { GYM_EXERCISES } from '../src/constants/data';

const mockDispatch = jest.fn();
const defaultState = { week: 1, checked: {} };

beforeEach(() => jest.clearAllMocks());

describe('GymScreen — exercise display', () => {
  test('renders all 6 exercises', () => {
    render(<GymScreen appState={defaultState} dispatch={mockDispatch} />);
    GYM_EXERCISES.forEach(ex => {
      expect(screen.getByText(ex.name)).toBeTruthy();
    });
  });

  test('shows Phase 1 for week 1-3', () => {
    render(<GymScreen appState={defaultState} dispatch={mockDispatch} />);
    expect(screen.getByText(/PHASE 1 OF 4/)).toBeTruthy();
  });

  test('shows Phase 2 for week 4-6', () => {
    render(<GymScreen appState={{ ...defaultState, week: 4 }} dispatch={mockDispatch} />);
    expect(screen.getByText(/PHASE 2 OF 4/)).toBeTruthy();
  });

  test('shows Phase 3 for week 7-9', () => {
    render(<GymScreen appState={{ ...defaultState, week: 7 }} dispatch={mockDispatch} />);
    expect(screen.getByText(/PHASE 3 OF 4/)).toBeTruthy();
  });

  test('shows Phase 4 for week 10-12', () => {
    render(<GymScreen appState={{ ...defaultState, week: 10 }} dispatch={mockDispatch} />);
    expect(screen.getByText(/PHASE 4 OF 4/)).toBeTruthy();
  });

  test('shows correct starting weights for week 1', () => {
    render(<GymScreen appState={defaultState} dispatch={mockDispatch} />);
    expect(screen.getByText(/10 kg dumbbell/)).toBeTruthy(); // goblet squat
    expect(screen.getByText(/8 kg per hand/)).toBeTruthy();  // shoulder press
  });

  test('shows increased weights for week 4', () => {
    render(<GymScreen appState={{ ...defaultState, week: 4 }} dispatch={mockDispatch} />);
    expect(screen.getByText(/12 kg dumbbell/)).toBeTruthy(); // goblet squat +2kg
  });
});

describe('GymScreen — exercise expansion', () => {
  test('how-to steps hidden by default', () => {
    render(<GymScreen appState={defaultState} dispatch={mockDispatch} />);
    expect(screen.queryByText('HOW TO DO IT')).toBeNull();
  });

  test('tapping exercise reveals how-to steps', () => {
    render(<GymScreen appState={defaultState} dispatch={mockDispatch} />);
    fireEvent.press(screen.getByText('Goblet Squat'));
    expect(screen.getByText('HOW TO DO IT')).toBeTruthy();
  });

  test('shows all 5 steps when expanded', () => {
    render(<GymScreen appState={defaultState} dispatch={mockDispatch} />);
    fireEvent.press(screen.getByText('Goblet Squat'));
    const goblet = GYM_EXERCISES.find(e => e.id === 'goblet');
    goblet.how.forEach(step => {
      expect(screen.getByText(step)).toBeTruthy();
    });
  });

  test('shows tip when expanded', () => {
    render(<GymScreen appState={defaultState} dispatch={mockDispatch} />);
    fireEvent.press(screen.getByText('Goblet Squat'));
    const goblet = GYM_EXERCISES.find(e => e.id === 'goblet');
    expect(screen.getByText(goblet.tip)).toBeTruthy();
  });

  test('tapping again collapses exercise', () => {
    render(<GymScreen appState={defaultState} dispatch={mockDispatch} />);
    fireEvent.press(screen.getByText('Goblet Squat'));
    expect(screen.getByText('HOW TO DO IT')).toBeTruthy();
    fireEvent.press(screen.getByText('Goblet Squat'));
    expect(screen.queryByText('HOW TO DO IT')).toBeNull();
  });
});

describe('GymScreen — set logging', () => {
  test('shows set buttons when exercise expanded', () => {
    render(<GymScreen appState={defaultState} dispatch={mockDispatch} />);
    fireEvent.press(screen.getByText('Goblet Squat'));
    expect(screen.getByText('Set 1')).toBeTruthy();
    expect(screen.getByText('Set 2')).toBeTruthy();
    expect(screen.getByText('Set 3')).toBeTruthy();
  });

  test('dispatches TOGGLE_CHECK when set tapped', () => {
    render(<GymScreen appState={defaultState} dispatch={mockDispatch} />);
    fireEvent.press(screen.getByText('Goblet Squat'));
    fireEvent.press(screen.getByText('Set 1'));
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'TOGGLE_CHECK',
      payload: 'w1_gym_goblet_0'
    });
  });

  test('shows ✓ for completed sets', () => {
    const state = { week: 1, checked: { 'w1_gym_goblet_0': true, 'w1_gym_goblet_1': true } };
    render(<GymScreen appState={state} dispatch={mockDispatch} />);
    fireEvent.press(screen.getByText('Goblet Squat'));
    const ticks = screen.getAllByText('✓');
    expect(ticks.length).toBeGreaterThanOrEqual(2);
  });

  test('shows 0/3 sets done initially', () => {
    render(<GymScreen appState={defaultState} dispatch={mockDispatch} />);
    expect(screen.getAllByText('0/3').length).toBeGreaterThan(0);
  });

  test('shows correct rest time for phase 1', () => {
    render(<GymScreen appState={defaultState} dispatch={mockDispatch} />);
    fireEvent.press(screen.getByText('Goblet Squat'));
    // Multiple exercises may show rest time - check at least one says 90s
    expect(screen.getAllByText(/Rest 90s/).length).toBeGreaterThan(0);
  });

  test('shows correct rest time for phase 3', () => {
    render(<GymScreen appState={{ ...defaultState, week: 7 }} dispatch={mockDispatch} />);
    fireEvent.press(screen.getByText('Goblet Squat'));
    expect(screen.getAllByText(/Rest 60s/).length).toBeGreaterThan(0);
  });
});
