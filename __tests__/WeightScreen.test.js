import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import WeightScreen from '../src/screens/WeightScreen';

const mockDispatch = jest.fn();

const stateNoWeights = { weights: [], goalLbs: 196 };
const stateWithWeights = {
  weights: [
    { date: '2026-01-01', lbs: 258 },
    { date: '2026-02-01', lbs: 250 },
    { date: '2026-03-01', lbs: 238 },
  ],
  goalLbs: 196,
};

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
    expect(screen.getAllByText('17st 0lb').length).toBeGreaterThan(0);
  });

  test('calculates loss correctly (positive = lost weight)', () => {
    render(<WeightScreen appState={stateWithWeights} dispatch={mockDispatch} />);
    // 258 - 238 = 20 lbs lost — shown as positive
    expect(screen.getAllByText('20 lbs').length).toBeGreaterThan(0);
  });

  test('shows to go correctly', () => {
    render(<WeightScreen appState={stateWithWeights} dispatch={mockDispatch} />);
    expect(screen.getAllByText('42.0 lbs').length).toBeGreaterThan(0);
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
          expect.objectContaining({ lbs: 244 })
        ])
      });
    });
  });

  test('switches to lbs input when lbs tab pressed', () => {
    render(<WeightScreen appState={stateNoWeights} dispatch={mockDispatch} />);
    fireEvent.press(screen.getByText('lbs'));
    expect(screen.getByPlaceholderText('e.g. 248')).toBeTruthy();
  });

  test('switches to kg input when kg tab pressed', () => {
    render(<WeightScreen appState={stateNoWeights} dispatch={mockDispatch} />);
    fireEvent.press(screen.getByText('kg'));
    expect(screen.getByPlaceholderText('e.g. 115')).toBeTruthy();
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
    fireEvent.changeText(screen.getByPlaceholderText('e.g. 248'), '40');
    fireEvent.press(screen.getByText('+ Log weight'));
    await waitFor(() => {
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  test('does not dispatch on invalid weight (too high)', async () => {
    render(<WeightScreen appState={stateNoWeights} dispatch={mockDispatch} />);
    fireEvent.press(screen.getByText('lbs'));
    fireEvent.changeText(screen.getByPlaceholderText('e.g. 248'), '750');
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

  test('shows clear all when entries exist, not when empty', () => {
    render(<WeightScreen appState={stateWithWeights} dispatch={mockDispatch} />);
    expect(screen.getByText('Clear all')).toBeTruthy();
    render(<WeightScreen appState={stateNoWeights} dispatch={mockDispatch} />);
    expect(screen.queryByText('Clear all')).toBeNull();
  });
});

describe('WeightScreen — milestones', () => {
  test('shows milestones list', () => {
    render(<WeightScreen appState={stateNoWeights} dispatch={mockDispatch} />);
    expect(screen.getByText(/Under 18st/)).toBeTruthy();
    expect(screen.getByText(/Goal — 14st/)).toBeTruthy();
  });

  test('marks milestones reached', () => {
    const state = { weights: [{ date: '2026-01-01', lbs: 235 }], goalLbs: 196 };
    render(<WeightScreen appState={state} dispatch={mockDispatch} />);
    const ticks = screen.getAllByText('✓');
    expect(ticks.length).toBeGreaterThanOrEqual(2);
  });
});
