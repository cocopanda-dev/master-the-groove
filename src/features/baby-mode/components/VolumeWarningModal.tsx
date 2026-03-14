// src/features/baby-mode/components/VolumeWarningModal.tsx
import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from '@design-system';
import { colors, spacing } from '@design-system/tokens';
import { BABY_MAX_VOLUME } from '../constants';

interface VolumeWarningModalProps {
  readonly visible: boolean;
  readonly onDismiss: () => void;
}

export const VolumeWarningModal = ({ visible, onDismiss }: VolumeWarningModalProps) => {
  if (!visible) return null;

  return (
    <View style={styles.overlay} testID="volume-warning-modal">
      <View style={styles.content}>
        <Text variant="h3" color={colors.babyTextPrimary} align="center">
          Volume Notice
        </Text>
        <Text variant="body" color={colors.babyTextSecondary} align="center">
          Baby Mode limits volume to {Math.round(BABY_MAX_VOLUME * 100)}% for your
          little one's safety. Please ensure your device volume is at a comfortable level.
        </Text>
        <Pressable
          onPress={onDismiss}
          style={styles.button}
          accessibilityLabel="Got it"
          accessibilityRole="button"
          testID="volume-warning-dismiss"
        >
          <Text variant="body" color={colors.babySurface}>
            Got It
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 998,
  },
  content: {
    backgroundColor: colors.babySurface,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.lg,
    width: '80%',
    maxWidth: 320,
  },
  button: {
    backgroundColor: colors.babyPrimary,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.sm,
  },
});
