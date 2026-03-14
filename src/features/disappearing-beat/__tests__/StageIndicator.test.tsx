// src/features/disappearing-beat/__tests__/StageIndicator.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { StageIndicator } from '../components/StageIndicator';

describe('StageIndicator', () => {
  it('renders warmup label', () => {
    const { getByText } = render(
      <StageIndicator stage="warmup" barCount={2} barsPerStage={8} />,
    );

    expect(getByText('Warm-up')).toBeTruthy();
    expect(getByText('Bar 2 / 8')).toBeTruthy();
  });

  it('renders stage 1 label', () => {
    const { getByText } = render(
      <StageIndicator stage="stage1" barCount={3} barsPerStage={8} />,
    );

    expect(getByText('Stage 1 of 3')).toBeTruthy();
  });

  it('renders stage 2 label', () => {
    const { getByText } = render(
      <StageIndicator stage="stage2" barCount={5} barsPerStage={8} />,
    );

    expect(getByText('Stage 2 of 3')).toBeTruthy();
  });

  it('renders stage 3 label', () => {
    const { getByText } = render(
      <StageIndicator stage="stage3" barCount={1} barsPerStage={4} />,
    );

    expect(getByText('Stage 3 of 3')).toBeTruthy();
  });

  it('renders return label', () => {
    const { getByText } = render(
      <StageIndicator stage="return" barCount={1} barsPerStage={4} />,
    );

    expect(getByText('Return')).toBeTruthy();
  });

  it('renders complete label', () => {
    const { getByText } = render(
      <StageIndicator stage="completed" barCount={0} barsPerStage={4} />,
    );

    expect(getByText('Complete')).toBeTruthy();
  });

  it('does not render bar counter for idle stage', () => {
    const { queryByText } = render(
      <StageIndicator stage="idle" barCount={0} barsPerStage={4} />,
    );

    expect(queryByText(/Bar/)).toBeNull();
  });

  it('does not render bar counter for completed stage', () => {
    const { queryByText } = render(
      <StageIndicator stage="completed" barCount={0} barsPerStage={4} />,
    );

    expect(queryByText(/Bar \d/)).toBeNull();
  });

  it('has correct accessibility label', () => {
    const { getByLabelText } = render(
      <StageIndicator stage="stage1" barCount={3} barsPerStage={8} />,
    );

    expect(getByLabelText('Stage 1 of 3, bar 3 of 8')).toBeTruthy();
  });
});
