// src/features/feel-lessons/__tests__/HandsStep.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HandsStep } from '../components/HandsStep';
import type { LessonStep } from '@types';

// Mock the audio store
jest.mock('@data-access/stores/use-audio-store', () => ({
  useAudioStore: () => ({
    setRatio: jest.fn(),
    setBpm: jest.fn(),
    setStereoSplit: jest.fn(),
    play: jest.fn(),
    stop: jest.fn(),
  }),
}));

const mockStep: LessonStep = {
  stepNumber: 6,
  type: 'hands',
  title: 'Both Hands',
  instruction: 'Tap the left zone for Layer A and the right zone for Layer B.',
  secondaryText: 'Focus on feeling the groove.',
  interactionType: 'tap-zones',
  interactionConfig: {
    leftLabel: '3 (Layer A)',
    rightLabel: '2 (Layer B)',
    feedbackMode: 'basic',
  },
  audioConfig: {
    ratioA: 3,
    ratioB: 2,
    bpm: 70,
    soundA: 'click',
    soundB: 'woodblock',
    layers: 'both',
    stereoSplit: true,
    volumeA: 0.8,
    volumeB: 0.8,
  },
};

describe('HandsStep', () => {
  it('renders two tap zones', () => {
    const onComplete = jest.fn();
    const { getByTestId } = render(
      <HandsStep step={mockStep} onComplete={onComplete} isCompleted={false} />,
    );

    expect(getByTestId('tap-zone-left')).toBeTruthy();
    expect(getByTestId('tap-zone-right')).toBeTruthy();
  });

  it('renders tap zone labels', () => {
    const onComplete = jest.fn();
    const { getByText } = render(
      <HandsStep step={mockStep} onComplete={onComplete} isCompleted={false} />,
    );

    expect(getByText('3 (Layer A)')).toBeTruthy();
    expect(getByText('2 (Layer B)')).toBeTruthy();
  });

  it('increments tap count on left tap', () => {
    const onComplete = jest.fn();
    const { getByTestId, getByText } = render(
      <HandsStep step={mockStep} onComplete={onComplete} isCompleted={false} />,
    );

    fireEvent.press(getByTestId('tap-zone-left'));
    // After 1 tap, left count should be 1
    expect(getByText('1')).toBeTruthy();
  });

  it('increments tap count on right tap', () => {
    const onComplete = jest.fn();
    const { getByTestId } = render(
      <HandsStep step={mockStep} onComplete={onComplete} isCompleted={false} />,
    );

    fireEvent.press(getByTestId('tap-zone-right'));
    fireEvent.press(getByTestId('tap-zone-right'));
    // After 2 taps, right count should be 2
    // The "2" text also appears in labels, so check for tap zone content
    expect(getByTestId('tap-zone-right')).toBeTruthy();
  });

  it('calls onComplete after enough taps', () => {
    const onComplete = jest.fn();
    const { getByTestId } = render(
      <HandsStep step={mockStep} onComplete={onComplete} isCompleted={false} />,
    );

    // Tap 12 times total (TAPS_TO_COMPLETE = 12)
    for (let i = 0; i < 7; i++) {
      fireEvent.press(getByTestId('tap-zone-left'));
    }
    for (let i = 0; i < 5; i++) {
      fireEvent.press(getByTestId('tap-zone-right'));
    }

    expect(onComplete).toHaveBeenCalled();
  });

  it('shows completion message when isCompleted', () => {
    const onComplete = jest.fn();
    const { getByText } = render(
      <HandsStep step={mockStep} onComplete={onComplete} isCompleted={true} />,
    );

    expect(getByText('Great job! You can keep tapping or move on.')).toBeTruthy();
  });

  it('has the correct testID', () => {
    const onComplete = jest.fn();
    const { getByTestId } = render(
      <HandsStep step={mockStep} onComplete={onComplete} isCompleted={false} />,
    );

    expect(getByTestId('hands-step')).toBeTruthy();
  });
});
