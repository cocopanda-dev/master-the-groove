// src/features/core-player/components/RadialVisualizer.tsx
// Placeholder RadialVisualizer — to be replaced with full Skia-based implementation.
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@design-system';
import { colors, spacing, borderRadius } from '@design-system/tokens';

interface RadialVisualizerProps {
  readonly ratioA: number;
  readonly ratioB: number;
  readonly interactive?: boolean;
}

export const RadialVisualizer = ({ ratioA, ratioB, interactive = false }: RadialVisualizerProps) => (
  <View
    style={styles.container}
    accessibilityLabel={`Polyrhythm visualizer showing ${ratioA} against ${ratioB}`}
    accessibilityRole="image"
  >
    <Text variant="h3" color={colors.layerA}>
      {ratioA}
    </Text>
    <Text variant="body" color={colors.textSecondary}>
      :
    </Text>
    <Text variant="h3" color={colors.layerB}>
      {ratioB}
    </Text>
    {!interactive && (
      <Text variant="caption" color={colors.textMuted}>
        View Only
      </Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 200,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: spacing.lg,
  },
});
