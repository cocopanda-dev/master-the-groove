// src/features/baby-mode/components/QuickLaunchButtons.tsx
import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from '@design-system';
import { colors, spacing } from '@design-system/tokens';

interface QuickLaunchButtonsProps {
  readonly onDuetTap: () => void;
  readonly onVisualizer: () => void;
}

export const QuickLaunchButtons = ({ onDuetTap, onVisualizer }: QuickLaunchButtonsProps) => (
  <View style={styles.container} testID="quick-launch-buttons">
    <Pressable
      onPress={onDuetTap}
      style={[styles.button, styles.duetButton]}
      accessibilityLabel="Duet Tap"
      accessibilityRole="button"
      testID="quick-launch-duet"
    >
      <Text variant="h4" color={colors.babySurface}>
        Duet Tap
      </Text>
    </Pressable>
    <Pressable
      onPress={onVisualizer}
      style={[styles.button, styles.visualizerButton]}
      accessibilityLabel="Baby Visualizer"
      accessibilityRole="button"
      testID="quick-launch-visualizer"
    >
      <Text variant="h4" color={colors.babySurface}>
        Visualizer
      </Text>
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  button: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: spacing.tapMinimumBaby,
  },
  duetButton: {
    backgroundColor: colors.babyTapZoneA,
  },
  visualizerButton: {
    backgroundColor: colors.babySecondary,
  },
});
