// src/features/baby-mode/__tests__/StageBanner.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { StageBanner } from '../components/StageBanner';
import type { BabyStageInfo } from '../types';

const makeStageInfo = (stage: number, name: string, ageRange: string): BabyStageInfo => ({
  stage,
  name,
  ageRange,
});

describe('StageBanner', () => {
  it('renders correct stage name for stage 2 (6-12 months)', () => {
    const { getByText } = render(
      <StageBanner stageInfo={makeStageInfo(2, 'Pat-a-Cake Mode', '6-12 months')} babyName="Luna" ageMonths={8} />,
    );

    expect(getByText(/Stage 2: Pat-a-Cake Mode/)).toBeTruthy();
    expect(getByText(/Luna/)).toBeTruthy();
  });

  it('renders correct stage name for stage 1 (3-6 months)', () => {
    const { getByText } = render(
      <StageBanner stageInfo={makeStageInfo(1, 'Parent Bounce Mode', '3-6 months')} babyName="Luna" ageMonths={4} />,
    );

    expect(getByText(/Stage 1: Parent Bounce Mode/)).toBeTruthy();
    expect(getByText(/Luna/)).toBeTruthy();
  });

  it('renders correct stage name for stage 3 (12-18 months)', () => {
    const { getByText } = render(
      <StageBanner stageInfo={makeStageInfo(3, 'Tap Mode', '12-18 months')} babyName="Luna" ageMonths={14} />,
    );

    expect(getByText(/Stage 3: Tap Mode/)).toBeTruthy();
    expect(getByText(/Luna/)).toBeTruthy();
  });

  it('uses stage override when set', () => {
    const { getByText } = render(
      <StageBanner stageInfo={makeStageInfo(1, 'Parent Bounce Mode', '3-6 months')} babyName="Luna" ageMonths={14} />,
    );

    expect(getByText(/Stage 1: Parent Bounce Mode/)).toBeTruthy();
  });

  it('displays fallback name when babyName is empty', () => {
    const { getByText } = render(
      <StageBanner stageInfo={makeStageInfo(2, 'Pat-a-Cake Mode', '6-12 months')} babyName="Your little one" ageMonths={8} />,
    );

    expect(getByText(/Your little one/)).toBeTruthy();
  });

  it('has testID for stage-banner', () => {
    const { getByTestId } = render(
      <StageBanner stageInfo={makeStageInfo(2, 'Pat-a-Cake Mode', '6-12 months')} babyName="Luna" ageMonths={8} />,
    );

    expect(getByTestId('stage-banner')).toBeTruthy();
  });
});
