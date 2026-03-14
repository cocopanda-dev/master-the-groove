// src/features/baby-mode/__tests__/ParentalGate.test.tsx
import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { ParentalGate } from '../components/ParentalGate';

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('ParentalGate', () => {
  it('renders two circles and instruction text', () => {
    const onUnlock = jest.fn();
    const { getByTestId, getByText } = render(
      <ParentalGate onUnlock={onUnlock} />,
    );

    expect(getByText('Hold both circles for 2 seconds')).toBeTruthy();
    expect(getByTestId('parental-gate-left')).toBeTruthy();
    expect(getByTestId('parental-gate-right')).toBeTruthy();
  });

  it('does not unlock on a single tap', () => {
    const onUnlock = jest.fn();
    const { getByTestId } = render(<ParentalGate onUnlock={onUnlock} />);

    // Just press and release the left circle
    fireEvent(getByTestId('parental-gate-left'), 'pressIn');
    act(() => {
      jest.advanceTimersByTime(2100);
    });
    fireEvent(getByTestId('parental-gate-left'), 'pressOut');

    expect(onUnlock).not.toHaveBeenCalled();
  });

  it('does not unlock when only one circle is held', () => {
    const onUnlock = jest.fn();
    const { getByTestId } = render(<ParentalGate onUnlock={onUnlock} />);

    // Hold only left circle for 3 seconds
    fireEvent(getByTestId('parental-gate-left'), 'pressIn');
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(onUnlock).not.toHaveBeenCalled();
  });

  it('unlocks when both circles are held for 2 seconds', () => {
    const onUnlock = jest.fn();
    const { getByTestId } = render(<ParentalGate onUnlock={onUnlock} />);

    // Press both circles
    fireEvent(getByTestId('parental-gate-left'), 'pressIn');
    fireEvent(getByTestId('parental-gate-right'), 'pressIn');

    // Hold for 2 seconds
    act(() => {
      jest.advanceTimersByTime(2100);
    });

    expect(onUnlock).toHaveBeenCalledTimes(1);
  });

  it('resets when a circle is released before 2 seconds', () => {
    const onUnlock = jest.fn();
    const { getByTestId } = render(<ParentalGate onUnlock={onUnlock} />);

    // Press both
    fireEvent(getByTestId('parental-gate-left'), 'pressIn');
    fireEvent(getByTestId('parental-gate-right'), 'pressIn');

    // Hold for 1 second
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Release one circle
    fireEvent(getByTestId('parental-gate-right'), 'pressOut');

    // Wait more time
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(onUnlock).not.toHaveBeenCalled();
  });

  it('shows progress bar while both circles held', () => {
    const onUnlock = jest.fn();
    const { getByTestId, queryByTestId } = render(
      <ParentalGate onUnlock={onUnlock} />,
    );

    // No progress initially
    expect(queryByTestId('parental-gate-progress')).toBeNull();

    // Press both
    fireEvent(getByTestId('parental-gate-left'), 'pressIn');
    fireEvent(getByTestId('parental-gate-right'), 'pressIn');

    // Advance to trigger progress update
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(getByTestId('parental-gate-progress')).toBeTruthy();
  });
});
