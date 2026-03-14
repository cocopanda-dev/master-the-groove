import React from 'react';
import { render } from '@testing-library/react-native';
import { ThreeStateIndicator } from '../components/ThreeStateIndicator';
import { colors } from '@design-system/tokens/colors';

describe('ThreeStateIndicator', () => {
  it('renders three circles', () => {
    const { getByTestId } = render(
      <ThreeStateIndicator currentState={null} testID="indicator" />,
    );
    expect(getByTestId('indicator-executing')).toBeTruthy();
    expect(getByTestId('indicator-hearing')).toBeTruthy();
    expect(getByTestId('indicator-feeling')).toBeTruthy();
  });

  it('all circles are outlined when state is null', () => {
    const { getByTestId } = render(
      <ThreeStateIndicator currentState={null} testID="indicator" />,
    );
    expect(getByTestId('indicator-executing')).toHaveStyle({ backgroundColor: 'transparent' });
    expect(getByTestId('indicator-hearing')).toHaveStyle({ backgroundColor: 'transparent' });
    expect(getByTestId('indicator-feeling')).toHaveStyle({ backgroundColor: 'transparent' });
  });

  it('fills first circle for executing state', () => {
    const { getByTestId } = render(
      <ThreeStateIndicator currentState="executing" testID="indicator" />,
    );
    expect(getByTestId('indicator-executing')).toHaveStyle({ backgroundColor: colors.textMuted });
    expect(getByTestId('indicator-hearing')).toHaveStyle({ backgroundColor: 'transparent' });
    expect(getByTestId('indicator-feeling')).toHaveStyle({ backgroundColor: 'transparent' });
  });

  it('fills first two circles for hearing state', () => {
    const { getByTestId } = render(
      <ThreeStateIndicator currentState="hearing" testID="indicator" />,
    );
    expect(getByTestId('indicator-executing')).toHaveStyle({ backgroundColor: colors.textMuted });
    expect(getByTestId('indicator-hearing')).toHaveStyle({ backgroundColor: colors.warning });
    expect(getByTestId('indicator-feeling')).toHaveStyle({ backgroundColor: 'transparent' });
  });

  it('fills all three circles for feeling state', () => {
    const { getByTestId } = render(
      <ThreeStateIndicator currentState="feeling" testID="indicator" />,
    );
    expect(getByTestId('indicator-executing')).toHaveStyle({ backgroundColor: colors.textMuted });
    expect(getByTestId('indicator-hearing')).toHaveStyle({ backgroundColor: colors.warning });
    expect(getByTestId('indicator-feeling')).toHaveStyle({ backgroundColor: colors.success });
  });

  it('has correct accessibility label', () => {
    const { getByLabelText } = render(
      <ThreeStateIndicator currentState="hearing" testID="indicator" />,
    );
    expect(getByLabelText('Feel state: hearing')).toBeTruthy();
  });

  it('shows "none" in accessibility label when state is null', () => {
    const { getByLabelText } = render(
      <ThreeStateIndicator currentState={null} testID="indicator" />,
    );
    expect(getByLabelText('Feel state: none')).toBeTruthy();
  });
});
