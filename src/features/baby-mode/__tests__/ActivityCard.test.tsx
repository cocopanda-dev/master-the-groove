// src/features/baby-mode/__tests__/ActivityCard.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ActivityCard } from '../components/ActivityCard';
import type { BabyActivityCard } from '../types';

const mockCard: BabyActivityCard = {
  id: 's1-bounce-basic',
  stageId: 1,
  title: 'Gentle Bounce',
  instruction: 'Hold your baby securely and gently bounce to the beat.',
  durationSeconds: 60,
  activityType: 'bounce',
  audioConfig: { bpm: 70, soundId: 'soft-chime' },
};

describe('ActivityCard', () => {
  it('renders card title', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <ActivityCard card={mockCard} onPress={onPress} />,
    );

    expect(getByText('Gentle Bounce')).toBeTruthy();
  });

  it('renders duration label in minutes', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <ActivityCard card={mockCard} onPress={onPress} />,
    );

    expect(getByText('1 min')).toBeTruthy();
  });

  it('renders duration label in seconds for short activities', () => {
    const onPress = jest.fn();
    const shortCard: BabyActivityCard = { ...mockCard, durationSeconds: 30 };
    const { getByText } = render(
      <ActivityCard card={shortCard} onPress={onPress} />,
    );

    expect(getByText('30s')).toBeTruthy();
  });

  it('calls onPress with the card when pressed', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <ActivityCard card={mockCard} onPress={onPress} />,
    );

    fireEvent.press(getByTestId('activity-card-s1-bounce-basic'));

    expect(onPress).toHaveBeenCalledWith(mockCard);
  });

  it('renders instruction text', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <ActivityCard card={mockCard} onPress={onPress} />,
    );

    expect(getByText('Hold your baby securely and gently bounce to the beat.')).toBeTruthy();
  });
});
