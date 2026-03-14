// src/features/baby-mode/__tests__/StageBanner.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { StageBanner } from '../components/StageBanner';

// Mock the baby store
const mockBabyProfile = {
  id: 'baby-1',
  userId: 'user-1',
  babyName: 'Luna',
  birthDate: '', // Will be set per test
  currentStage: 2 as const,
  stageOverride: null as number | null,
};

jest.mock('@data-access/stores/use-baby-store', () => ({
  useBabyStore: (selector: (state: { babyProfile: typeof mockBabyProfile | null }) => unknown) =>
    selector({ babyProfile: mockBabyProfile }),
}));

describe('StageBanner', () => {
  beforeEach(() => {
    mockBabyProfile.stageOverride = null;
    mockBabyProfile.babyName = 'Luna';
  });

  it('renders correct stage name for stage 2 (6-12 months)', () => {
    // Set birthDate to 8 months ago
    const now = new Date();
    const birth = new Date(now.getUTCFullYear(), now.getUTCMonth() - 8, 1);
    mockBabyProfile.birthDate = birth.toISOString().split('T')[0]!;

    const { getByText } = render(<StageBanner />);

    expect(getByText('Stage 2: Pat-a-Cake Mode')).toBeTruthy();
    expect(getByText('Luna, 8 months')).toBeTruthy();
  });

  it('renders correct stage name for stage 1 (3-6 months)', () => {
    const now = new Date();
    const birth = new Date(now.getUTCFullYear(), now.getUTCMonth() - 4, 1);
    mockBabyProfile.birthDate = birth.toISOString().split('T')[0]!;

    const { getByText } = render(<StageBanner />);

    expect(getByText('Stage 1: Parent Bounce Mode')).toBeTruthy();
    expect(getByText('Luna, 4 months')).toBeTruthy();
  });

  it('renders correct stage name for stage 3 (12-18 months)', () => {
    const now = new Date();
    const birth = new Date(now.getUTCFullYear(), now.getUTCMonth() - 14, 1);
    mockBabyProfile.birthDate = birth.toISOString().split('T')[0]!;

    const { getByText } = render(<StageBanner />);

    expect(getByText('Stage 3: Tap Mode')).toBeTruthy();
    expect(getByText('Luna, 14 months')).toBeTruthy();
  });

  it('uses stage override when set', () => {
    const now = new Date();
    const birth = new Date(now.getUTCFullYear(), now.getUTCMonth() - 14, 1);
    mockBabyProfile.birthDate = birth.toISOString().split('T')[0]!;
    mockBabyProfile.stageOverride = 1;

    const { getByText } = render(<StageBanner />);

    expect(getByText('Stage 1: Parent Bounce Mode')).toBeTruthy();
  });

  it('displays fallback name when babyName is empty', () => {
    mockBabyProfile.babyName = '';
    const now = new Date();
    const birth = new Date(now.getUTCFullYear(), now.getUTCMonth() - 8, 1);
    mockBabyProfile.birthDate = birth.toISOString().split('T')[0]!;

    const { getByText } = render(<StageBanner />);

    expect(getByText('Your little one, 8 months')).toBeTruthy();
  });

  it('has testID for stage-banner', () => {
    const now = new Date();
    const birth = new Date(now.getUTCFullYear(), now.getUTCMonth() - 8, 1);
    mockBabyProfile.birthDate = birth.toISOString().split('T')[0]!;

    const { getByTestId } = render(<StageBanner />);

    expect(getByTestId('stage-banner')).toBeTruthy();
  });
});
