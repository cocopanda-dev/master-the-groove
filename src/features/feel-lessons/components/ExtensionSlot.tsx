// src/features/feel-lessons/components/ExtensionSlot.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@design-system';
import { colors, spacing, borderRadius } from '@design-system/tokens';

interface ExtensionSlotProps {
  /** Identifier for this extension slot */
  readonly slotId: string;
  /** Description of the upcoming feature */
  readonly label: string;
}

/**
 * Generic "Coming soon" placeholder for future feature extensions.
 * Hidden at MVP — rendered as a non-interactive indicator.
 */
export const ExtensionSlot = ({ slotId, label }: ExtensionSlotProps) => (
  <View style={styles.container} testID={`extension-slot-${slotId}`}>
    <Text variant="caption" color={colors.textMuted}>
      {label} — Coming soon
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.md,
    opacity: 0.6,
  },
});
