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
      <BpmControl bpm={90} ratioA={3} ratioB={2} onBpmChange={mockOnBpmChange} onTapTempo={mockOnTapTempo} />,
    );
    expect(getByTestId('bpm-display')).toBeTruthy();
  });

  it('renders slider', () => {
    const { getByTestId } = render(
      <BpmControl bpm={120} ratioA={3} ratioB={2} onBpmChange={mockOnBpmChange} onTapTempo={mockOnTapTempo} />,
    );
    expect(getByTestId('bpm-slider')).toBeTruthy();
  });

  it('renders tap tempo button', () => {
    const { getByTestId } = render(
      <BpmControl bpm={90} ratioA={3} ratioB={2} onBpmChange={mockOnBpmChange} onTapTempo={mockOnTapTempo} />,
    );
    expect(getByTestId('tap-tempo-button')).toBeTruthy();
  });

  it('calls onTapTempo when tap button pressed', () => {
    const { getByTestId } = render(
      <BpmControl bpm={90} ratioA={3} ratioB={2} onBpmChange={mockOnBpmChange} onTapTempo={mockOnTapTempo} />,
    );
    fireEvent.press(getByTestId('tap-tempo-button'));
    expect(mockOnTapTempo).toHaveBeenCalledTimes(1);
  });

  it('shows correct BPM value in accessibilityLabel', () => {
    const { getByTestId } = render(
      <BpmControl bpm={140} ratioA={3} ratioB={2} onBpmChange={mockOnBpmChange} onTapTempo={mockOnTapTempo} />,
    );
    const display = getByTestId('bpm-display');
    expect(display.props.accessibilityLabel).toContain('140');
  });

  it('slider has correct accessibility label', () => {
    const { getByTestId } = render(
      <BpmControl bpm={100} ratioA={3} ratioB={2} onBpmChange={mockOnBpmChange} onTapTempo={mockOnTapTempo} />,
    );
    const slider = getByTestId('bpm-slider');
    expect(slider.props.accessibilityLabel).toContain('100');
  });

  it('renders the tap button with correct accessibility hint', () => {
    const { getByTestId } = render(
      <BpmControl bpm={90} ratioA={3} ratioB={2} onBpmChange={mockOnBpmChange} onTapTempo={mockOnTapTempo} />,
    );
    const tapBtn = getByTestId('tap-tempo-button');
    expect(tapBtn.props.accessibilityHint).toContain('BPM');
  });

  it('shows per-layer effective BPM for 3:2 at 120 BPM', () => {
    // 3:2, lcm=6. Layer A = 120*3/6=60, Layer B = 120*2/6=40
    const { getByTestId, getByText } = render(
      <BpmControl bpm={120} ratioA={3} ratioB={2} onBpmChange={mockOnBpmChange} onTapTempo={mockOnTapTempo} />,
    );
    expect(getByTestId('layer-bpm-display')).toBeTruthy();
    expect(getByText('60 BPM')).toBeTruthy();
    expect(getByText('40 BPM')).toBeTruthy();
  });

  it('shows per-layer effective BPM for 4:3 at 90 BPM', () => {
    // 4:3, lcm=12. Layer A = 90*4/12=30, Layer B = 90*3/12=23 (22.5 rounded)
    const { getByText } = render(
      <BpmControl bpm={90} ratioA={4} ratioB={3} onBpmChange={mockOnBpmChange} onTapTempo={mockOnTapTempo} />,
    );
    expect(getByText('30 BPM')).toBeTruthy();
    expect(getByText('23 BPM')).toBeTruthy();
  });
});
