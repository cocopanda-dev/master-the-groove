// src/features/baby-mode/__tests__/DuetTapScreen.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { DuetTapScreen } from '../components/DuetTapScreen';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

// Mock the baby store
const mockBabyProfile = {
  id: 'baby-1',
  userId: 'user-1',
  babyName: 'Luna',
  birthDate: '2025-06-01',
  currentStage: 2 as const,
  stageOverride: null,
};

jest.mock('@data-access/stores/use-baby-store', () => ({
  useBabyStore: (selector: (state: { babyProfile: typeof mockBabyProfile; logBabySession: jest.Mock }) => unknown) =>
    selector({ babyProfile: mockBabyProfile, logBabySession: jest.fn() }),
}));

// Mock keep awake
jest.mock('@navigation/hooks', () => ({
  useKeepAwakeWhilePlaying: jest.fn(),
}));

describe('DuetTapScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders both tap zones', () => {
    const { getByTestId } = render(<DuetTapScreen />);

    expect(getByTestId('tap-zone-parent')).toBeTruthy();
    expect(getByTestId('tap-zone-baby')).toBeTruthy();
  });

  it('renders parent zone with "You" label', () => {
    const { getByText } = render(<DuetTapScreen />);
    expect(getByText('You')).toBeTruthy();
  });

  it('renders baby zone with baby name', () => {
    const { getByText } = render(<DuetTapScreen />);
    expect(getByText('Luna')).toBeTruthy();
  });

  it('renders close button', () => {
    const { getByTestId } = render(<DuetTapScreen />);
    expect(getByTestId('duet-tap-close')).toBeTruthy();
  });

  it('renders BPM label', () => {
    const { getByText } = render(<DuetTapScreen />);
    expect(getByText('80 BPM')).toBeTruthy();
  });

  it('tap zones have correct accessibility labels', () => {
    const { getByLabelText } = render(<DuetTapScreen />);
    expect(getByLabelText('Parent tap zone')).toBeTruthy();
    expect(getByLabelText('Luna tap zone')).toBeTruthy();
  });

  it('tap zones have button accessibility role', () => {
    const { getByTestId } = render(<DuetTapScreen />);

    expect(getByTestId('tap-zone-parent').props.accessibilityRole).toBe('button');
    expect(getByTestId('tap-zone-baby').props.accessibilityRole).toBe('button');
  });
});
