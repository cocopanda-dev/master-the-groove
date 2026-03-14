// src/features/feel-lessons/__tests__/BodyStep.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { BodyStep } from '../components/BodyStep';
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
  stepNumber: 5,
  type: 'body',
  title: 'Walk + Clap',
  instruction: 'Walk in place to the 2-beat pulse.',
  secondaryText: 'Keep going for 60 seconds.',
  interactionType: 'timer',
  interactionConfig: {
    durationSeconds: 60,
  },
  audioConfig: {
    ratioA: 3,
    ratioB: 2,
    bpm: 66,
    soundA: 'click',
    soundB: 'woodblock',
    layers: 'both',
    stereoSplit: true,
    volumeA: 0.8,
    volumeB: 0.8,
  },
};

describe('BodyStep', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders instruction text', () => {
    const onComplete = jest.fn();
    const { getByText } = render(
      <BodyStep step={mockStep} onComplete={onComplete} isCompleted={false} />,
    );

    expect(getByText('Walk in place to the 2-beat pulse.')).toBeTruthy();
  });

  it('renders the initial timer showing 1:00', () => {
    const onComplete = jest.fn();
    const { getByText } = render(
      <BodyStep step={mockStep} onComplete={onComplete} isCompleted={false} />,
    );

    expect(getByText('1:00')).toBeTruthy();
  });

  it('renders the Tap to Start button', () => {
    const onComplete = jest.fn();
    const { getByText } = render(
      <BodyStep step={mockStep} onComplete={onComplete} isCompleted={false} />,
    );

    expect(getByText('Tap to Start')).toBeTruthy();
  });

  it('shows Done! when completed', () => {
    const onComplete = jest.fn();
    const { getByText } = render(
      <BodyStep step={mockStep} onComplete={onComplete} isCompleted={true} />,
    );

    expect(getByText('Done!')).toBeTruthy();
  });

  it('has the correct testID', () => {
    const onComplete = jest.fn();
    const { getByTestId } = render(
      <BodyStep step={mockStep} onComplete={onComplete} isCompleted={false} />,
    );

    expect(getByTestId('body-step')).toBeTruthy();
  });
});
