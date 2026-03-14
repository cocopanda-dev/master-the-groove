import React from 'react';
import { render } from '@testing-library/react-native';
import { WeeklyOverviewCard } from '../components/WeeklyOverviewCard';

describe('WeeklyOverviewCard', () => {
  const baseProps = {
    totalMinutes: 42,
    sessionCount: 6,
    polyrhythmsVisited: ['3-2', '4-3'],
    streak: 5,
    feelStateChanges: [],
  };

  it('displays total minutes', () => {
    const { getByText } = render(<WeeklyOverviewCard {...baseProps} testID="weekly" />);
    expect(getByText('42 min')).toBeTruthy();
  });

  it('displays session count', () => {
    const { getByText } = render(<WeeklyOverviewCard {...baseProps} testID="weekly" />);
    expect(getByText('6')).toBeTruthy();
    expect(getByText('sessions')).toBeTruthy();
  });

  it('displays singular "session" for count of 1', () => {
    const { getByText } = render(
      <WeeklyOverviewCard {...baseProps} sessionCount={1} testID="weekly" />,
    );
    expect(getByText('1')).toBeTruthy();
    expect(getByText('session')).toBeTruthy();
  });

  it('displays streak', () => {
    const { getByText } = render(<WeeklyOverviewCard {...baseProps} testID="weekly" />);
    expect(getByText('5-day')).toBeTruthy();
    expect(getByText('streak')).toBeTruthy();
  });

  it('displays polyrhythms visited', () => {
    const { getByText } = render(<WeeklyOverviewCard {...baseProps} testID="weekly" />);
    expect(getByText('3-2, 4-3')).toBeTruthy();
  });

  it('shows week range in header', () => {
    const { getByText } = render(<WeeklyOverviewCard {...baseProps} testID="weekly" />);
    // The header includes "This Week (...)" - we just check it contains "This Week"
    expect(getByText(/This Week/)).toBeTruthy();
  });

  it('displays feel state progression callout', () => {
    const props = {
      ...baseProps,
      feelStateChanges: [{ polyrhythmId: '3-2', from: 'executing' as const, to: 'hearing' as const }],
    };
    const { getByText } = render(<WeeklyOverviewCard {...props} testID="weekly" />);
    expect(getByText(/3-2 moved from Executing to Hearing this week/)).toBeTruthy();
  });

  it('displays feel state regression callout with encouraging message', () => {
    const props = {
      ...baseProps,
      feelStateChanges: [{ polyrhythmId: '3-2', from: 'hearing' as const, to: 'executing' as const }],
    };
    const { getByText } = render(<WeeklyOverviewCard {...props} testID="weekly" />);
    expect(getByText(/that's normal, keep going/)).toBeTruthy();
  });

  it('shows 0 streak when no streak', () => {
    const { getByText } = render(
      <WeeklyOverviewCard {...baseProps} streak={0} testID="weekly" />,
    );
    expect(getByText('0')).toBeTruthy();
  });
});
