// src/features/feel-lessons/__tests__/ContextStep.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { ContextStep } from '../components/ContextStep';
import type { LessonStep } from '@types';

const mockStep: LessonStep = {
  stepNumber: 1,
  type: 'context',
  title: 'Hear It In Music',
  instruction: 'The 3:2 polyrhythm is one of the most fundamental rhythmic patterns.',
  secondaryText: 'Listen for the interplay between the groups.',
  audioConfig: null,
};

describe('ContextStep', () => {
  it('renders instruction text', () => {
    const { getByText } = render(<ContextStep step={mockStep} />);

    expect(
      getByText('The 3:2 polyrhythm is one of the most fundamental rhythmic patterns.'),
    ).toBeTruthy();
  });

  it('renders secondary text when provided', () => {
    const { getByText } = render(<ContextStep step={mockStep} />);

    expect(
      getByText('Listen for the interplay between the groups.'),
    ).toBeTruthy();
  });

  it('does not render secondary text when not provided', () => {
    const stepWithoutSecondary: LessonStep = {
      ...mockStep,
      secondaryText: undefined,
    };
    const { queryByText } = render(<ContextStep step={stepWithoutSecondary} />);

    expect(
      queryByText('Listen for the interplay between the groups.'),
    ).toBeNull();
  });

  it('renders the extension slot placeholder', () => {
    const { getByTestId } = render(<ContextStep step={mockStep} />);

    expect(getByTestId('extension-slot-real-music-context')).toBeTruthy();
  });

  it('has the correct testID', () => {
    const { getByTestId } = render(<ContextStep step={mockStep} />);

    expect(getByTestId('context-step')).toBeTruthy();
  });
});
