// src/features/disappearing-beat/__tests__/TapTarget.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TapTarget } from '../components/TapTarget';

// Silence Animated warnings in test environment
jest.useFakeTimers();

describe('TapTarget', () => {
  const onTap = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when stage is stage3', () => {
    const { getByText } = render(
      <TapTarget stage="stage3" onTap={onTap} />,
    );

    expect(getByText(/Tap/)).toBeTruthy();
    expect(getByText(/Beat 1/)).toBeTruthy();
  });

  it('does not render when stage is warmup', () => {
    const { queryByText } = render(
      <TapTarget stage="warmup" onTap={onTap} />,
    );

    expect(queryByText(/Tap/)).toBeNull();
  });

  it('does not render when stage is stage1', () => {
    const { queryByText } = render(
      <TapTarget stage="stage1" onTap={onTap} />,
    );

    expect(queryByText(/Tap/)).toBeNull();
  });

  it('does not render when stage is stage2', () => {
    const { queryByText } = render(
      <TapTarget stage="stage2" onTap={onTap} />,
    );

    expect(queryByText(/Tap/)).toBeNull();
  });

  it('does not render when stage is return', () => {
    const { queryByText } = render(
      <TapTarget stage="return" onTap={onTap} />,
    );

    expect(queryByText(/Tap/)).toBeNull();
  });

  it('does not render when stage is idle', () => {
    const { queryByText } = render(
      <TapTarget stage="idle" onTap={onTap} />,
    );

    expect(queryByText(/Tap/)).toBeNull();
  });

  it('calls onTap when pressed', () => {
    const { getByRole } = render(
      <TapTarget stage="stage3" onTap={onTap} />,
    );

    const button = getByRole('button');
    fireEvent.press(button);

    expect(onTap).toHaveBeenCalledTimes(1);
    expect(typeof onTap.mock.calls[0]![0]).toBe('number');
  });

  it('has correct accessibility attributes', () => {
    const { getByRole } = render(
      <TapTarget stage="stage3" onTap={onTap} />,
    );

    const button = getByRole('button');
    expect(button.props.accessibilityLabel).toBe('Tap beat 1');
    expect(button.props.accessibilityHint).toBe('Tap when you feel beat 1');
  });
});
