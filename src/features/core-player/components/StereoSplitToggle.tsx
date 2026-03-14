// src/features/core-player/components/StereoSplitToggle.tsx
import React from 'react';
import { Pressable, StyleSheet, View, Text } from 'react-native';
import { colors } from '@design-system/tokens/colors';
import { spacing } from '@design-system/tokens/spacing';
import { borderRadius } from '@design-system/tokens/border-radius';
import { fontSize } from '@design-system/tokens/typography';

type StereoSplitToggleProps = {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
};

export const StereoSplitToggle = ({ enabled, onToggle }: StereoSplitToggleProps) => (
  <Pressable
    onPress={() => onToggle(!enabled)}
    accessibilityLabel={enabled ? 'Stereo split on, tap to turn off' : 'Stereo split off, tap to turn on'}
    accessibilityRole="switch"
    accessibilityState={{ checked: enabled }}
    style={[styles.container, enabled && styles.containerActive]}
    testID="stereo-split-toggle"
  >
    {/* Headphone icon (text fallback) */}
    <Text style={[styles.icon, enabled && styles.iconActive]}>🎧</Text>
    <View style={styles.labelContainer}>
      <Text style={[styles.label, enabled && styles.labelActive]}>Stereo Split</Text>
      <Text style={styles.sublabel}>
        {enabled ? 'Layer A: Left  •  Layer B: Right' : 'Both layers: center'}
      </Text>
    </View>
    {/* Toggle indicator */}
    <View style={[styles.toggle, enabled && styles.toggleActive]}>
      <View style={[styles.toggleThumb, enabled && styles.toggleThumbActive]} />
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  containerActive: {
    borderColor: colors.primaryLight,
  },
  icon: {
    fontSize: 20,
    opacity: 0.5,
  },
  iconActive: {
    opacity: 1,
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  labelActive: {
    color: colors.textPrimary,
  },
  sublabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.border,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: colors.primaryLight,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.textPrimary,
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
});
