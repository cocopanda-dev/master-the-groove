import React from 'react';
import { ActivityIndicator } from 'react-native';
import type { SpinnerProps } from './types';
import { colors } from '../../tokens/colors';

export const Spinner = ({
  size = 'small',
  color = colors.primaryLight,
  accessibilityLabel = 'Loading',
}: SpinnerProps) => (
  <ActivityIndicator
    size={size}
    color={color}
    accessibilityRole="progressbar"
    accessibilityLabel={accessibilityLabel}
  />
);
