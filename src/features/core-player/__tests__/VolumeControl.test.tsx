// src/features/core-player/__tests__/VolumeControl.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { VolumeControl } from '../components/VolumeControl';

const mockOnVolumeChange = jest.fn();
const mockOnMuteToggle = jest.fn();

describe('VolumeControl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders volume slider for Layer A', () => {
    const { getByTestId } = render(
      <VolumeControl
        layerId="A"
        volume={0.8}
        muted={false}
        onVolumeChange={mockOnVolumeChange}
        onMuteToggle={mockOnMuteToggle}
      />,
    );
    expect(getByTestId('volume-slider-A')).toBeTruthy();
  });

  it('renders mute button', () => {
    const { getByTestId } = render(
      <VolumeControl
        layerId="B"
        volume={0.8}
        muted={false}
        onVolumeChange={mockOnVolumeChange}
        onMuteToggle={mockOnMuteToggle}
      />,
    );
    expect(getByTestId('mute-button-B')).toBeTruthy();
  });

  it('calls onMuteToggle when mute button pressed', () => {
    const { getByTestId } = render(
      <VolumeControl
        layerId="A"
        volume={0.8}
        muted={false}
        onVolumeChange={mockOnVolumeChange}
        onMuteToggle={mockOnMuteToggle}
      />,
    );
    fireEvent.press(getByTestId('mute-button-A'));
    expect(mockOnMuteToggle).toHaveBeenCalledTimes(1);
  });

  it('shows muted state in accessibility', () => {
    const { getByTestId } = render(
      <VolumeControl
        layerId="A"
        volume={0.8}
        muted={true}
        onVolumeChange={mockOnVolumeChange}
        onMuteToggle={mockOnMuteToggle}
      />,
    );
    const muteBtn = getByTestId('mute-button-A');
    expect(muteBtn.props.accessibilityState).toMatchObject({ checked: true });
  });

  it('shows unmuted state in accessibility', () => {
    const { getByTestId } = render(
      <VolumeControl
        layerId="A"
        volume={0.8}
        muted={false}
        onVolumeChange={mockOnVolumeChange}
        onMuteToggle={mockOnMuteToggle}
      />,
    );
    const muteBtn = getByTestId('mute-button-A');
    expect(muteBtn.props.accessibilityState).toMatchObject({ checked: false });
  });

  it('displays correct volume percentage in accessibility label', () => {
    const { getByTestId } = render(
      <VolumeControl
        layerId="A"
        volume={0.5}
        muted={false}
        onVolumeChange={mockOnVolumeChange}
        onMuteToggle={mockOnMuteToggle}
      />,
    );
    const slider = getByTestId('volume-slider-A');
    expect(slider.props.accessibilityLabel).toContain('50');
  });

  it('sets slider to 0 when muted', () => {
    const { getByTestId } = render(
      <VolumeControl
        layerId="A"
        volume={0.8}
        muted={true}
        onVolumeChange={mockOnVolumeChange}
        onMuteToggle={mockOnMuteToggle}
      />,
    );
    const slider = getByTestId('volume-slider-A');
    expect(slider.props.accessibilityValue?.now).toBe(0);
  });
});
