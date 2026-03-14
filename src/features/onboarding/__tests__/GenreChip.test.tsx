// src/features/onboarding/__tests__/GenreChip.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { GenreChip } from '../components/GenreChip';

describe('GenreChip', () => {
  it('renders the genre name', () => {
    const { getByText } = render(
      <GenreChip genre="Jazz" selected={false} onToggle={jest.fn()} />,
    );

    expect(getByText('Jazz')).toBeTruthy();
  });

  it('calls onToggle with genre name when pressed', () => {
    const onToggle = jest.fn();
    const { getByTestId } = render(
      <GenreChip genre="Jazz" selected={false} onToggle={onToggle} />,
    );

    fireEvent.press(getByTestId('genre-chip-Jazz'));
    expect(onToggle).toHaveBeenCalledWith('Jazz');
  });

  it('reports checked accessibility state when selected', () => {
    const { getByTestId } = render(
      <GenreChip genre="Rock" selected={true} onToggle={jest.fn()} />,
    );

    const chip = getByTestId('genre-chip-Rock');
    expect(chip.props.accessibilityState.checked).toBe(true);
  });

  it('reports unchecked accessibility state when not selected', () => {
    const { getByTestId } = render(
      <GenreChip genre="Rock" selected={false} onToggle={jest.fn()} />,
    );

    const chip = getByTestId('genre-chip-Rock');
    expect(chip.props.accessibilityState.checked).toBe(false);
  });

  it('can toggle multiple genres independently', () => {
    const onToggle = jest.fn();
    const { getByTestId } = render(
      <>
        <GenreChip genre="Jazz" selected={true} onToggle={onToggle} />
        <GenreChip genre="Rock" selected={false} onToggle={onToggle} />
        <GenreChip genre="Hip-Hop" selected={true} onToggle={onToggle} />
      </>,
    );

    fireEvent.press(getByTestId('genre-chip-Rock'));
    expect(onToggle).toHaveBeenCalledWith('Rock');

    fireEvent.press(getByTestId('genre-chip-Jazz'));
    expect(onToggle).toHaveBeenCalledWith('Jazz');

    // Verify both calls happened
    expect(onToggle).toHaveBeenCalledTimes(2);
  });
});
