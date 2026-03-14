// src/features/baby-mode/components/TimeLimitScreen.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from '@design-system';
import { colors, spacing } from '@design-system/tokens';

interface TimeLimitScreenProps {
  /** Whether the one-time extension has already been used */
  readonly hasExtended: boolean;
  /** Extend the session by 60 seconds */
  readonly onExtend: () => void;
  /** End the session and navigate away */
  readonly onEnd: () => void;
}

/**
 * Full-screen overlay shown when the baby session time limit is reached.
 * Offers a one-time 60-second extension or the option to end the session.
 */
const TimeLimitScreen = ({
  hasExtended,
  onExtend,
  onEnd,
}: TimeLimitScreenProps) => (
  <View style={styles.container}>
    <Text variant="h1" color={colors.babyTextPrimary} align="center">
      Time for a break!
    </Text>
    <Text
      variant="body"
      color={colors.babyTextSecondary}
      align="center"
    >
      Great job! That was a wonderful session.
    </Text>

    <View style={styles.buttonGroup}>
      {!hasExtended && (
        <Button
          accessibilityLabel="Extend session by 1 minute"
          accessibilityHint="Adds 60 more seconds to the session"
          onPress={onExtend}
          variant="primary"
          size="lg"
        >
          1 more minute
        </Button>
      )}
      <Button
        accessibilityLabel="End session"
        accessibilityHint="Ends the baby mode session"
        onPress={onEnd}
        variant={hasExtended ? 'primary' : 'secondary'}
        size="lg"
      >
        All done!
      </Button>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.babyBackground,
    padding: spacing.xl,
    gap: spacing.lg,
    zIndex: 100,
  },
  buttonGroup: {
    gap: spacing.md,
    marginTop: spacing.md,
    width: '100%',
    maxWidth: 300,
  },
});

export { TimeLimitScreen };
export type { TimeLimitScreenProps };
