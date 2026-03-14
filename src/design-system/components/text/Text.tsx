import React from 'react';
import { Text as RNText } from 'react-native';
import type { TextProps } from './types';
import { variantStyles, defaultColor } from './styles';

export const Text = ({
  variant = 'body',
  color,
  align = 'left',
  children,
  ...rest
}: TextProps) => (
  <RNText
    style={[
      variantStyles[variant],
      { color: color ?? defaultColor, textAlign: align },
    ]}
    {...rest}
  >
    {children}
  </RNText>
);
