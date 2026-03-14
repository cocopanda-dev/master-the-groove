import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Icon } from '@design-system';
import { colors, spacing } from '@design-system/tokens';
import { useRouter } from 'expo-router';

type EmptyStateProps = {
  readonly message: string;
  readonly ctaLabel?: string;
  readonly onPress?: () => void;
  readonly testID?: string;
};

/**
 * Reusable empty state with message, icon, and optional CTA.
 * Defaults CTA to "Go to Practice" navigating to /(tabs)/practice.
 */
const EmptyState = ({ message, ctaLabel = 'Go to Practice', onPress, testID }: EmptyStateProps) => {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/(tabs)/practice');
    }
  };

  return (
    <View style={styles.container} testID={testID}>
      <Icon name="music-note" size={48} color={colors.textMuted} decorative />
      <Text variant="body" color={colors.textSecondary} align="center">
        {message}
      </Text>
      <Button
        accessibilityLabel={ctaLabel}
        onPress={handlePress}
        variant="primary"
        size="md"
      >
        {ctaLabel}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
});

export { EmptyState };
export type { EmptyStateProps };
