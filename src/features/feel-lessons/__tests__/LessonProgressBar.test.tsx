// src/features/feel-lessons/__tests__/LessonProgressBar.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { LessonProgressBar } from '../components/LessonProgressBar';

describe('LessonProgressBar', () => {
  it('renders the correct number of step dots', () => {
    const { getAllByTestId } = render(
      <LessonProgressBar
        totalSteps={7}
        currentStepIndex={0}
        completedSteps={new Set()}
      />,
    );

    const dots = getAllByTestId(/^progress-dot-/);
    expect(dots).toHaveLength(7);
  });

  it('shows step numbers in the dots', () => {
    const { getByText } = render(
      <LessonProgressBar
        totalSteps={7}
        currentStepIndex={2}
        completedSteps={new Set()}
      />,
    );

    // Uncompleted steps should show numbers
    expect(getByText('4')).toBeTruthy();
    expect(getByText('5')).toBeTruthy();
  });

  it('shows checkmark for completed steps', () => {
    const { getAllByText } = render(
      <LessonProgressBar
        totalSteps={7}
        currentStepIndex={3}
        completedSteps={new Set([0, 1, 2])}
      />,
    );

    // Completed steps should show checkmark character
    const checkmarks = getAllByText('\u2713');
    expect(checkmarks).toHaveLength(3);
  });

  it('renders with accessibility label', () => {
    const { getByLabelText } = render(
      <LessonProgressBar
        totalSteps={7}
        currentStepIndex={2}
        completedSteps={new Set([0, 1])}
      />,
    );

    expect(getByLabelText('Step 3 of 7')).toBeTruthy();
  });
});
