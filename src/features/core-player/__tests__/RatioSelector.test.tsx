// src/features/core-player/__tests__/RatioSelector.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RatioSelector } from '../components/RatioSelector';
import { MVP_RATIOS } from '../constants';

const mockOnSelect = jest.fn();

describe('RatioSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all MVP ratio pills', () => {
    const { getByTestId } = render(
      <RatioSelector selectedRatioId="3-2" onSelect={mockOnSelect} />,
    );
    for (const ratio of MVP_RATIOS) {
      expect(getByTestId(`ratio-pill-${ratio.id}`)).toBeTruthy();
    }
  });

  it('calls onSelect when an active ratio is pressed', () => {
    const { getByTestId } = render(
      <RatioSelector selectedRatioId="3-2" onSelect={mockOnSelect} />,
    );
    fireEvent.press(getByTestId('ratio-pill-4-3'));
    expect(mockOnSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: '4-3' }),
    );
  });

  it('does not call onSelect when a coming-soon ratio is pressed', () => {
    const { getByTestId } = render(
      <RatioSelector selectedRatioId="3-2" onSelect={mockOnSelect} />,
    );
    // 2-3 is coming soon
    fireEvent.press(getByTestId('ratio-pill-2-3'));
    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  it('shows the selected ratio pill as selected', () => {
    const { getByTestId } = render(
      <RatioSelector selectedRatioId="4-3" onSelect={mockOnSelect} />,
    );
    const pill = getByTestId('ratio-pill-4-3');
    expect(pill).toBeTruthy();
    expect(pill.props.accessibilityState).toMatchObject({ selected: true });
  });

  it('marks coming-soon pills as disabled', () => {
    const { getByTestId } = render(
      <RatioSelector selectedRatioId="3-2" onSelect={mockOnSelect} />,
    );
    const pill = getByTestId('ratio-pill-2-3');
    expect(pill.props.accessibilityState).toMatchObject({ disabled: true });
  });

  it('marks active ratio pills as not disabled', () => {
    const { getByTestId } = render(
      <RatioSelector selectedRatioId="3-2" onSelect={mockOnSelect} />,
    );
    const pill = getByTestId('ratio-pill-3-2');
    expect(pill.props.accessibilityState).toMatchObject({ disabled: false });
  });
});
