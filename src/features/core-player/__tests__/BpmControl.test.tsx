// src/features/core-player/__tests__/BpmControl.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BpmControl } from '../components/BpmControl';

const mockOnBpmChange = jest.fn();
const mockOnTapTempo = jest.fn();

describe('BpmControl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders BPM display', () => {
    const { getByTestId } = render(
      <BpmControl bpm={90} onBpmChange={mockOnBpmChange} onTapTempo={mockOnTapTempo} />,
    );
    expect(getByTestId('bpm-display')).toBeTruthy();
  });

  it('renders slider', () => {
    const { getByTestId } = render(
      <BpmControl bpm={120} onBpmChange={mockOnBpmChange} onTapTempo={mockOnTapTempo} />,
    );
    expect(getByTestId('bpm-slider')).toBeTruthy();
  });

  it('renders tap tempo button', () => {
    const { getByTestId } = render(
      <BpmControl bpm={90} onBpmChange={mockOnBpmChange} onTapTempo={mockOnTapTempo} />,
    );
    expect(getByTestId('tap-tempo-button')).toBeTruthy();
  });

  it('calls onTapTempo when tap button pressed', () => {
    const { getByTestId } = render(
      <BpmControl bpm={90} onBpmChange={mockOnBpmChange} onTapTempo={mockOnTapTempo} />,
    );
    fireEvent.press(getByTestId('tap-tempo-button'));
    expect(mockOnTapTempo).toHaveBeenCalledTimes(1);
  });

  it('shows correct BPM value in accessibilityLabel', () => {
    const { getByTestId } = render(
      <BpmControl bpm={140} onBpmChange={mockOnBpmChange} onTapTempo={mockOnTapTempo} />,
    );
    const display = getByTestId('bpm-display');
    expect(display.props.accessibilityLabel).toContain('140');
  });

  it('slider has correct accessibility label', () => {
    const { getByTestId } = render(
      <BpmControl bpm={100} onBpmChange={mockOnBpmChange} onTapTempo={mockOnTapTempo} />,
    );
    const slider = getByTestId('bpm-slider');
    expect(slider.props.accessibilityLabel).toContain('100');
  });

  it('renders the tap button with correct accessibility hint', () => {
    const { getByTestId } = render(
      <BpmControl bpm={90} onBpmChange={mockOnBpmChange} onTapTempo={mockOnTapTempo} />,
    );
    const tapBtn = getByTestId('tap-tempo-button');
    expect(tapBtn.props.accessibilityHint).toContain('BPM');
  });
});
