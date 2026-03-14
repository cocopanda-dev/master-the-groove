// src/features/baby-mode/__tests__/ParentalGate.test.tsx
import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { ParentalGate } from '../components/ParentalGate';
import { PARENTAL_GATE_HOLD_MS } from '../constants';

describe('ParentalGate', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the gate UI', () => {
    const onPass = jest.fn();
    const onCancel = jest.fn();
    const { getByTestId, getByText } = render(
      <ParentalGate onPass={onPass} onCancel={onCancel} />,
    );

    expect(getByTestId('parental-gate')).toBeTruthy();
    expect(getByText('Parent Check')).toBeTruthy();
    expect(getByText('Hold both circles for 2 seconds to exit Baby Mode')).toBeTruthy();
  });

  it('calls onPass after holding both circles for the required duration', () => {
    const onPass = jest.fn();
    const onCancel = jest.fn();
    const { getByTestId } = render(
      <ParentalGate onPass={onPass} onCancel={onCancel} />,
    );

    // Press both circles
    act(() => {
      fireEvent(getByTestId('parental-gate-left'), 'pressIn');
      fireEvent(getByTestId('parental-gate-right'), 'pressIn');
    });

    // Wait for the hold duration
    act(() => {
      jest.advanceTimersByTime(PARENTAL_GATE_HOLD_MS);
    });

    expect(onPass).toHaveBeenCalledTimes(1);
  });

  it('does not call onPass if only one circle is held', () => {
    const onPass = jest.fn();
    const onCancel = jest.fn();
    const { getByTestId } = render(
      <ParentalGate onPass={onPass} onCancel={onCancel} />,
    );

    act(() => {
      fireEvent(getByTestId('parental-gate-left'), 'pressIn');
    });

    act(() => {
      jest.advanceTimersByTime(PARENTAL_GATE_HOLD_MS + 500);
    });

    expect(onPass).not.toHaveBeenCalled();
  });

  it('does not call onPass if circles released early', () => {
    const onPass = jest.fn();
    const onCancel = jest.fn();
    const { getByTestId } = render(
      <ParentalGate onPass={onPass} onCancel={onCancel} />,
    );

    act(() => {
      fireEvent(getByTestId('parental-gate-left'), 'pressIn');
      fireEvent(getByTestId('parental-gate-right'), 'pressIn');
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Release one circle
    act(() => {
      fireEvent(getByTestId('parental-gate-left'), 'pressOut');
    });

    act(() => {
      jest.advanceTimersByTime(PARENTAL_GATE_HOLD_MS);
    });

    expect(onPass).not.toHaveBeenCalled();
  });

  it('calls onCancel when cancel button is pressed', () => {
    const onPass = jest.fn();
    const onCancel = jest.fn();
    const { getByTestId } = render(
      <ParentalGate onPass={onPass} onCancel={onCancel} />,
    );

    fireEvent.press(getByTestId('parental-gate-cancel'));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
