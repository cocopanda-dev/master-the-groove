// src/features/disappearing-beat/components/VolumeIndicator.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@design-system';
import { colors } from '@design-system/tokens/colors';
import { spacing } from '@design-system/tokens/spacing';
import { borderRadius } from '@design-system/tokens/border-radius';

type VolumeIndicatorProps = {
  readonly label: string;
  readonly volume: number;
  readonly color: string;
};

export const VolumeIndicator = ({ label, volume, color }: VolumeIndicatorProps) => {
  const percentage = Math.round(volume * 100);

  return (
    <View
      style={styles.container}
      accessibilityRole="text"
      accessibilityLabel={`${label} volume ${percentage}%`}
    >
      <Text variant="caption" color={colors.textSecondary}>{label}</Text>
      <View style={styles.barBackground}>
        <View
          style={[
            styles.barFill,
            { width: `${percentage}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text variant="caption" color={colors.textSecondary}>{percentage}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  barBackground: {
    flex: 1,
    height: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
});
