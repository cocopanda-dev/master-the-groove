// src/design-system/components/card/types.ts
import type { ReactNode } from 'react';
import type { ViewStyle, StyleProp } from 'react-native';

export type CardVariant = 'default' | 'elevated' | 'outlined';

export type CardProps = {
  children: ReactNode;
  variant?: CardVariant;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};
