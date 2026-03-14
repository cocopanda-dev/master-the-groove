import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { IconProps } from './types';
import { colors } from '../../tokens/colors';

export const Icon = (props: IconProps) => {
  const { name, size = 24, color = colors.textPrimary, testID } = props;
  const isDecorative = 'decorative' in props && props.decorative === true;

  return (
    <View
      testID={testID}
      accessibilityLabel={isDecorative ? undefined : props.accessibilityLabel}
      accessibilityRole={isDecorative ? undefined : 'image'}
      accessibilityElementsHidden={isDecorative}
      importantForAccessibility={isDecorative ? 'no-hide-descendants' : 'yes'}
      style={[styles.container, { width: size, height: size }]}
    >
      <Text style={[styles.placeholder, { fontSize: size * 0.6, color }]}>
        {name.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    textAlign: 'center',
  },
});
