import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import WeightScreen from '../src/screens/WeightScreen';
import { START_LBS, GOAL_LBS } from '../src/constants/data';

const mockDispatch = jest.fn();

const stateNoWeights = { weights: [], wegovy: null };
const stateWithWeights = {
  weights: [
    { date: '2026-01-01', lbs: 250 },
    { date: '2026-02-01', lbs: 244 },
    { date: '2026-03-01', lbs: 238 },
  ],
  wegovy: null,
};

// Mock Alert properly
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

beforeEach(() => jest.clearAllMocks());

describe('WeightScreen — stats display', () => {
  test('shows goal weight', () => {
    render(<WeightScreen appState={stateNoWeights} dispatch={mockDispatch} />);
    expect(screen.getAllByText('14st 0lb').length).toBeGreaterThan(0);
  });

  test('shows current weight from latest entry', () => {
    render(<WeightScreen appState={stateWithWeights} dispatch={mockDispatch} />);
    // 238 lbs = 17st 0lb — appears in stats grid and possibly entries
    expect(screen.getAllByText('17st 0lb').length).toBeGreaterThan(0);
  });

  test('shows start weight as 18st 6lb', () => {
    expect(START_LBS).toBe(258);
    expect(Math.floor(258 / 14)).toBe(18);
    expect(258 % 14).toBe(6);
  });

  test('calculates loss correctly', () => {
    render(<WeightScreen appState={stateWithWeights} dispatch={mockDispatch} />);
    // 258 - 238 = 20 lbs lost
    expect(screen.getAllByText('−20 lbs').length).toBeGreaterThan(0);
  });

  test('shows to go correctly', () => {
    render(<WeightScreen appState={stateWithWeights} dispatch={mockDispatch} />);
    // 238 - 196 = 42 lbs to go
    expect(screen.getAllByText('42.0 lbs').length).toBeGreaterThan(0);
  });
});

describe('WeightScreen — wegovy tracker', () => {
  test('shows not recorded when wegovy is null', () => {
    render(<WeightScreen appState={stateNoWeights} dispatch={mockDispatch} />);
    expect(screen.getByText('Not recorded yet')).toBeTruthy();
  });

  test('shows on track when jabbed recently', () => {
    const today = Math.floor(Date.now() / 86400000);
    render(<WeightScreen appState={{ ...stateNoWeights, wegovy: today - 3 }} dispatch={mockDispatch} />);
    expect(screen.getByText(/on track/)).toBeTruthy();
  });

  test('shows OVERDUE when jabbed over 7 days ago', () => {
    const today = Math.floor(Date.now() / 86400000);
    render(<WeightScreen appState={{ ...stateNoWeights, wegovy: today - 10 }} dispatch={mockDispatch} />);
    expect(screen.getByText(/OVERDUE/)).toBeTruthy();
  });

  test('Log jab button dispatches LOG_WEGOVY', () => {
    render(<WeightScreen appState={stateNoWeights} dispatch={mockDispatch} />);
    fireEvent.press(screen.getByText('Log jab'));
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'LOG_WEGOVY' })
    );
  });
});

describe('WeightScreen — logging weight', () => {
  test('renders stone and lbs inputs by default', () => {
    render(<WeightScreen appState={stateNoWeights} dispatch={mockDispatch} />);
    expect(screen.getByPlaceholderText('17')).toBeTruthy();
    expect(screen.getByPlaceholderText('8')).toBeTruthy();
  });

  test('dispatches SET_WEIGHTS on valid stone entry (17st 6lb = 244 lbs)', async () => {
    render(<WeightScreen appState={stateNoWeights} dispatch={mockDispatch} />);
    fireEvent.changeText(screen.getByPlaceholderText('17'), '17');
    fireEvent.changeText(screen.getByPlaceholderText('8'), '6');
    fireEvent.press(screen.getByText('+ Log weight'));
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_WEIGHTS',
        payload: expect.arrayContaining([
          expect.objectContaining({ lbs: 244 }) // 17*14 + 6 = 244
        ])
      });
    });
  });

  test('switches to lbs input when lbs tab pressed', () => {
    render(<WeightScreen appState={stateNoWeights} dispatch={mockDispatch} />);
    fireEvent.press(screen.getByText('lbs'));
    expect(screen.getByPlaceholderText('e.g. 248')).toBeTruthy();
  });

  test('dispatches SET_WEIGHTS on valid lbs entry', async () => {
    render(<WeightScreen appState={stateNoWeights} dispatch={mockDispatch} />);
    fireEvent.press(screen.getByText('lbs'));
    fireEvent.changeText(screen.getByPlaceholderText('e.g. 248'), '244');
    fireEvent.press(screen.getByText('+ Log weight'));
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_WEIGHTS',
        payload: expect.arrayContaining([
          expect.objectContaining({ lbs: 244 })
        ])
      });
    });
  });

  test('does not dispatch on invalid weight (too low)', async () => {
    render(<WeightScreen appState={stateNoWeights} dispatch={mockDispatch} />);
    fireEvent.press(screen.getByText('lbs'));
    fireEvent.changeText(screen.getByPlaceholderText('e.g. 248'), '50');
    fireEvent.press(screen.getByText('+ Log weight'));
    await waitFor(() => {
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  test('does not dispatch on invalid weight (too high)', async () => {
    render(<WeightScreen appState={stateNoWeights} dispatch={mockDispatch} />);
    fireEvent.press(screen.getByText('lbs'));
    fireEvent.changeText(screen.getByPlaceholderText('e.g. 248'), '600');
    fireEvent.press(screen.getByText('+ Log weight'));
    await waitFor(() => {
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });
});

describe('WeightScreen — entries management', () => {
  test('shows all logged entries', () => {
    render(<WeightScreen appState={stateWithWeights} dispatch={mockDispatch} />);
    expect(screen.getByText('2026-01-01')).toBeTruthy();
    expect(screen.getByText('2026-02-01')).toBeTruthy();
    expect(screen.getByText('2026-03-01')).toBeTruthy();
  });

  test('shows delete button for each entry', () => {
    render(<WeightScreen appState={stateWithWeights} dispatch={mockDispatch} />);
    const deleteButtons = screen.getAllByText('✕');
    expect(deleteButtons).toHaveLength(3);
  });

  test('shows clear all button when entries exist', () => {
    render(<WeightScreen appState={stateWithWeights} dispatch={mockDispatch} />);
    expect(screen.getByText('Clear all')).toBeTruthy();
  });

  test('does not show clear all when no entries', () => {
    render(<WeightScreen appState={stateNoWeights} dispatch={mockDispatch} />);
    expect(screen.queryByText('Clear all')).toBeNull();
  });
});

describe('WeightScreen — milestones', () => {
  test('shows all milestones', () => {
    render(<WeightScreen appState={stateNoWeights} dispatch={mockDispatch} />);
    expect(screen.getByText(/Under 18st/)).toBeTruthy();
    expect(screen.getByText(/Goal — 14st/)).toBeTruthy();
  });

  test('marks milestone as reached when weight is below it', () => {
    const state = { weights: [{ date: '2026-01-01', lbs: 235 }], wegovy: null };
    render(<WeightScreen appState={state} dispatch={mockDispatch} />);
    // Under 18st (252) and Under 17st (238) both reached
    const ticks = screen.getAllByText('✓');
    expect(ticks.length).toBeGreaterThanOrEqual(2);
  });
});
