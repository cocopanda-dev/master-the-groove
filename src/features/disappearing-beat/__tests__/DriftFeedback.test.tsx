// src/features/disappearing-beat/__tests__/DriftFeedback.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { DriftFeedback } from '../components/DriftFeedback';

describe('DriftFeedback', () => {
  it('renders locked-in zone correctly', () => {
    const { getByText } = render(
      <DriftFeedback driftMs={25} zone="locked-in" />,
    );

    expect(getByText('25ms')).toBeTruthy();
    expect(getByText('Late')).toBeTruthy();
    expect(getByText('Locked In')).toBeTruthy();
  });

  it('renders close zone correctly', () => {
    const { getByText } = render(
      <DriftFeedback driftMs={80} zone="close" />,
    );

    expect(getByText('80ms')).toBeTruthy();
    expect(getByText('Late')).toBeTruthy();
    expect(getByText('Close')).toBeTruthy();
  });

  it('renders drifting zone correctly', () => {
    const { getByText } = render(
      <DriftFeedback driftMs={150} zone="drifting" />,
    );

    expect(getByText('150ms')).toBeTruthy();
    expect(getByText('Drifting')).toBeTruthy();
  });

  it('renders early (negative) drift with correct direction', () => {
    const { getByText } = render(
      <DriftFeedback driftMs={-30} zone="locked-in" />,
    );

    expect(getByText('30ms')).toBeTruthy();
    expect(getByText('Early')).toBeTruthy();
    expect(getByText('<')).toBeTruthy();
  });

  it('renders late (positive) drift with correct arrow', () => {
    const { getByText } = render(
      <DriftFeedback driftMs={30} zone="locked-in" />,
    );

    expect(getByText('>')).toBeTruthy();
    expect(getByText('Late')).toBeTruthy();
  });

  it('renders zero drift as "On time"', () => {
    const { getByText } = render(
      <DriftFeedback driftMs={0} zone="locked-in" />,
    );

    expect(getByText('0ms')).toBeTruthy();
    expect(getByText('On time')).toBeTruthy();
  });

  it('renders missed zone correctly', () => {
    const { getAllByText, getByText } = render(
      <DriftFeedback driftMs={null} zone="missed" />,
    );

    // '--' appears for both magnitude and direction
    expect(getAllByText('--').length).toBeGreaterThanOrEqual(1);
    expect(getByText('Missed')).toBeTruthy();
  });

  it('has correct accessibility label', () => {
    const { getByLabelText } = render(
      <DriftFeedback driftMs={45} zone="locked-in" />,
    );

    expect(getByLabelText('Drift: 45ms Late. Zone: Locked In')).toBeTruthy();
  });
});
