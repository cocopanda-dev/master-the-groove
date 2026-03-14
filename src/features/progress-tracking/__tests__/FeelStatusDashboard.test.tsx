import React from 'react';
import { render } from '@testing-library/react-native';
import { FeelStatusDashboard } from '../components/FeelStatusDashboard';
import type { PolyrhythmProgress } from '../types';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

const makePolyrhythm = (overrides: Partial<PolyrhythmProgress> = {}): PolyrhythmProgress => ({
  polyrhythmId: '3-2',
  name: '3:2',
  currentFeelState: null,
  lastPracticedAt: new Date().toISOString(),
  sessionCount: 5,
  ...overrides,
});

describe('FeelStatusDashboard', () => {
  const onPress = jest.fn();

  beforeEach(() => {
    onPress.mockClear();
  });

  it('renders empty state when no polyrhythms', () => {
    const { getByText } = render(
      <FeelStatusDashboard polyrhythms={[]} onPolyrhythmPress={onPress} testID="dashboard" />,
    );
    expect(getByText('Start a practice session to see your progress here')).toBeTruthy();
  });

  it('renders polyrhythm cards in order', () => {
    const polys: PolyrhythmProgress[] = [
      makePolyrhythm({ polyrhythmId: '3-2', name: '3:2' }),
      makePolyrhythm({ polyrhythmId: '4-3', name: '4:3' }),
    ];
    const { getByText } = render(
      <FeelStatusDashboard polyrhythms={polys} onPolyrhythmPress={onPress} testID="dashboard" />,
    );
    expect(getByText('3:2')).toBeTruthy();
    expect(getByText('4:3')).toBeTruthy();
  });

  it('shows Feel Status header when polyrhythms exist', () => {
    const polys = [makePolyrhythm()];
    const { getByText } = render(
      <FeelStatusDashboard polyrhythms={polys} onPolyrhythmPress={onPress} testID="dashboard" />,
    );
    expect(getByText('Feel Status')).toBeTruthy();
  });

  it('shows session count for each card', () => {
    const polys = [makePolyrhythm({ sessionCount: 12 })];
    const { getByText } = render(
      <FeelStatusDashboard polyrhythms={polys} onPolyrhythmPress={onPress} testID="dashboard" />,
    );
    expect(getByText('12 sessions')).toBeTruthy();
  });

  it('shows singular "session" for count of 1', () => {
    const polys = [makePolyrhythm({ sessionCount: 1 })];
    const { getByText } = render(
      <FeelStatusDashboard polyrhythms={polys} onPolyrhythmPress={onPress} testID="dashboard" />,
    );
    expect(getByText('1 session')).toBeTruthy();
  });
});
