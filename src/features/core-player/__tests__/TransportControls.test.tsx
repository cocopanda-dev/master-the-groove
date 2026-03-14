// src/features/core-player/__tests__/TransportControls.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TransportControls } from '../components/TransportControls';

const mockOnPlay = jest.fn();
const mockOnPause = jest.fn();
const mockOnStop = jest.fn();

describe('TransportControls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders play button when idle', () => {
    const { getByTestId } = render(
      <TransportControls
        status="idle"
        onPlay={mockOnPlay}
        onPause={mockOnPause}
        onStop={mockOnStop}
      />,
    );
    expect(getByTestId('transport-play')).toBeTruthy();
  });

  it('renders pause button when playing', () => {
    const { getByTestId } = render(
      <TransportControls
        status="playing"
        onPlay={mockOnPlay}
        onPause={mockOnPause}
        onStop={mockOnStop}
      />,
    );
    expect(getByTestId('transport-pause')).toBeTruthy();
  });

  it('calls onPlay when play button pressed', () => {
    const { getByTestId } = render(
      <TransportControls
        status="idle"
        onPlay={mockOnPlay}
        onPause={mockOnPause}
        onStop={mockOnStop}
      />,
    );
    fireEvent.press(getByTestId('transport-play'));
    expect(mockOnPlay).toHaveBeenCalledTimes(1);
  });

  it('calls onPause when pause button pressed while playing', () => {
    const { getByTestId } = render(
      <TransportControls
        status="playing"
        onPlay={mockOnPlay}
        onPause={mockOnPause}
        onStop={mockOnStop}
      />,
    );
    fireEvent.press(getByTestId('transport-pause'));
    expect(mockOnPause).toHaveBeenCalledTimes(1);
  });

  it('calls onStop when stop button pressed', () => {
    const { getByTestId } = render(
      <TransportControls
        status="playing"
        onPlay={mockOnPlay}
        onPause={mockOnPause}
        onStop={mockOnStop}
      />,
    );
    fireEvent.press(getByTestId('transport-stop'));
    expect(mockOnStop).toHaveBeenCalledTimes(1);
  });

  it('stop button is disabled when idle', () => {
    const { getByTestId } = render(
      <TransportControls
        status="idle"
        onPlay={mockOnPlay}
        onPause={mockOnPause}
        onStop={mockOnStop}
      />,
    );
    const stopBtn = getByTestId('transport-stop');
    expect(stopBtn.props.accessibilityState?.disabled).toBe(true);
  });

  it('renders play button when paused', () => {
    const { getByTestId } = render(
      <TransportControls
        status="paused"
        onPlay={mockOnPlay}
        onPause={mockOnPause}
        onStop={mockOnStop}
      />,
    );
    expect(getByTestId('transport-play')).toBeTruthy();
  });

  it('calls onPlay when pressing play from paused state', () => {
    const { getByTestId } = render(
      <TransportControls
        status="paused"
        onPlay={mockOnPlay}
        onPause={mockOnPause}
        onStop={mockOnStop}
      />,
    );
    fireEvent.press(getByTestId('transport-play'));
    expect(mockOnPlay).toHaveBeenCalledTimes(1);
  });
});
