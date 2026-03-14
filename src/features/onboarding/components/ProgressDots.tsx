// src/features/onboarding/components/ProgressDots.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@design-system/tokens/colors';

interface ProgressDotsProps {
  readonly total: number;
  readonly currentIndex: number;
}

export const ProgressDots = ({ total, currentIndex }: ProgressDotsProps) => (
  <View style={styles.container} accessibilityRole="progressbar" accessibilityLabel={`Step ${currentIndex + 1} of ${total}`}>
    {Array.from({ length: total }, (_, i) => (
      <View
        key={i}
        style={[
          styles.dot,
          i < currentIndex && styles.completed,
          i === currentIndex && styles.active,
          i > currentIndex && styles.inactive,
        ]}
        testID={`progress-dot-${i}`}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  active: {
    backgroundColor: colors.primary,
  },
  completed: {
    backgroundColor: colors.success,
  },
  inactive: {
    backgroundColor: colors.textMuted,
  },
});
