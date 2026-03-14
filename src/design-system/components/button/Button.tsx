import React from 'react';
import { Pressable, Text } from 'react-native';
import type { ButtonProps } from './types';
import { baseStyles, sizeStyles, variantBg, variantText } from './styles';

export const Button = ({
  accessibilityLabel,
  accessibilityHint,
  onPress,
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
}: ButtonProps) => {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      style={[
        baseStyles.container,
        sizeStyles[size],
        { backgroundColor: variantBg[variant] },
        isDisabled && baseStyles.disabled,
      ]}
    >
      <Text style={[baseStyles.text, { color: variantText[variant] }]}>
        {children}
      </Text>
    </Pressable>
  );
};
