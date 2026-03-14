// src/features/baby-mode/__tests__/DuetTapScreen.test.tsx
import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { useBabyStore } from '@data-access/stores';
import { DuetTapScreenComponent } from '../components/DuetTapScreen';

describe('DuetTapScreenComponent', () => {
  const defaultProps = {
    babyProfileId: 'test-baby-id',
    babyName: 'Luna',
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.useFakeTimers();
    defaultProps.onClose = jest.fn();
    useBabyStore.setState({
      babyProfile: {
        id: 'test-baby-id',
        userId: 'user-1',
        babyName: 'Luna',
        birthDate: '2025-06-01',
        currentStage: 3,
        stageOverride: null,
      },
      babySessions: [],
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the duet tap screen', () => {
    const { getByTestId } = render(<DuetTapScreenComponent {...defaultProps} />);

    expect(getByTestId('duet-tap-screen')).toBeTruthy();
  });

  it('renders parent and baby tap zones', () => {
    const { getByTestId } = render(<DuetTapScreenComponent {...defaultProps} />);

    expect(getByTestId('parent-tap-zone')).toBeTruthy();
    expect(getByTestId('baby-tap-zone')).toBeTruthy();
  });

  it('renders BPM controls', () => {
    const { getByTestId } = render(<DuetTapScreenComponent {...defaultProps} />);

    expect(getByTestId('bpm-display')).toBeTruthy();
    expect(getByTestId('bpm-decrease')).toBeTruthy();
    expect(getByTestId('bpm-increase')).toBeTruthy();
  });

  it('adjusts BPM with stepper buttons', () => {
    const { getByTestId, getByText } = render(<DuetTapScreenComponent {...defaultProps} />);

    fireEvent.press(getByTestId('bpm-increase'));
    expect(getByText('85 BPM')).toBeTruthy();

    fireEvent.press(getByTestId('bpm-decrease'));
    expect(getByText('80 BPM')).toBeTruthy();
  });

  it('tap zones are pressable', () => {
    const { getByTestId } = render(<DuetTapScreenComponent {...defaultProps} />);

    // Should not throw
    fireEvent.press(getByTestId('parent-tap-zone'));
    fireEvent.press(getByTestId('baby-tap-zone'));
  });

  it('shows celebration burst when both zones tapped within window', () => {
    const { getByTestId, queryByTestId } = render(
      <DuetTapScreenComponent {...defaultProps} />,
    );

    // Initially no celebration
    expect(queryByTestId('celebration-burst')).toBeNull();

    // Tap both zones quickly
    act(() => {
      fireEvent.press(getByTestId('parent-tap-zone'));
      fireEvent.press(getByTestId('baby-tap-zone'));
    });

    // Celebration should appear
    expect(getByTestId('celebration-burst')).toBeTruthy();
  });

  it('shows response prompt when close button is pressed', () => {
    const { getByTestId } = render(<DuetTapScreenComponent {...defaultProps} />);

    fireEvent.press(getByTestId('duet-tap-close'));

    // Should show response prompt
    expect(getByTestId('baby-response-prompt')).toBeTruthy();
  });
});
