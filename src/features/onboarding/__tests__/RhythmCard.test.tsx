// src/features/onboarding/__tests__/RhythmCard.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RhythmCard } from '../components/RhythmCard';
import type { RhythmOption } from '../types';

const availableOption: RhythmOption = {
  id: '3-2',
  name: '3:2',
  displayName: 'Three against Two',
  culturalOrigin: 'Afro-Cuban clave',
  available: true,
};

const comingSoonOption: RhythmOption = {
  id: '2-3',
  name: '2:3',
  displayName: 'Two against Three',
  culturalOrigin: 'Reverse clave',
  available: false,
};

describe('RhythmCard', () => {
  it('renders rhythm name and cultural origin', () => {
    const { getByText } = render(
      <RhythmCard option={availableOption} selected={false} onToggle={jest.fn()} />,
    );

    expect(getByText('3:2')).toBeTruthy();
    expect(getByText('Afro-Cuban clave')).toBeTruthy();
  });

  it('calls onToggle when pressed', () => {
    const onToggle = jest.fn();
    const { getByTestId } = render(
      <RhythmCard option={availableOption} selected={false} onToggle={onToggle} />,
    );

    fireEvent.press(getByTestId('rhythm-card-3-2'));
    expect(onToggle).toHaveBeenCalledWith('3-2');
  });

  it('does not call onToggle when coming soon option is pressed', () => {
    const onToggle = jest.fn();
    const { getByTestId } = render(
      <RhythmCard option={comingSoonOption} selected={false} onToggle={onToggle} />,
    );

    fireEvent.press(getByTestId('rhythm-card-2-3'));
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('shows "Coming soon" badge for unavailable options', () => {
    const { getByText } = render(
      <RhythmCard option={comingSoonOption} selected={false} onToggle={jest.fn()} />,
    );

    expect(getByText('Coming soon')).toBeTruthy();
  });

  it('does not show "Coming soon" badge for available options', () => {
    const { queryByText } = render(
      <RhythmCard option={availableOption} selected={false} onToggle={jest.fn()} />,
    );

    expect(queryByText('Coming soon')).toBeNull();
  });

  it('reports selected accessibility state when selected', () => {
    const { getByTestId } = render(
      <RhythmCard option={availableOption} selected={true} onToggle={jest.fn()} />,
    );

    const card = getByTestId('rhythm-card-3-2');
    expect(card.props.accessibilityState.checked).toBe(true);
  });
});
