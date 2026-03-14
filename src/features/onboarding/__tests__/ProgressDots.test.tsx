// src/features/onboarding/__tests__/ProgressDots.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { ProgressDots } from '../components/ProgressDots';

describe('ProgressDots', () => {
  it('renders the correct number of dots', () => {
    const { getAllByTestId } = render(
      <ProgressDots total={5} currentIndex={0} />,
    );

    const dots = getAllByTestId(/^progress-dot-/);
    expect(dots).toHaveLength(5);
  });

  it('renders 4 dots when total is 4', () => {
    const { getAllByTestId } = render(
      <ProgressDots total={4} currentIndex={0} />,
    );

    const dots = getAllByTestId(/^progress-dot-/);
    expect(dots).toHaveLength(4);
  });

  it('has correct accessibility label', () => {
    const { getByLabelText } = render(
      <ProgressDots total={5} currentIndex={2} />,
    );

    const progressBar = getByLabelText('Step 3 of 5');
    expect(progressBar).toBeTruthy();
  });
});
