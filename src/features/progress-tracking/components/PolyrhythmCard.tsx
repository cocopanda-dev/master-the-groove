import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text } from '@design-system';
import { colors, spacing, borderRadius } from '@design-system/tokens';
import type { FeelState } from '@types';
import { ThreeStateIndicator } from './ThreeStateIndicator';
import { formatRelativeDate } from '../utils';

type PolyrhythmCardProps = {
  readonly polyrhythmId: string;
  readonly name: string;
  readonly currentFeelState: FeelState | null;
  readonly lastPracticedAt: string | null;
  readonly sessionCount: number;
  readonly onPress: (polyrhythmId: string) => void;
  readonly testID?: string;
};

/**
 * Individual polyrhythm card showing ratio name, feel state indicator,
 * last practiced date, and session count.
 */
const PolyrhythmCard = ({
  polyrhythmId,
  name,
  currentFeelState,
  lastPracticedAt,
  sessionCount,
  onPress,
  testID,
}: PolyrhythmCardProps) => (
  <Pressable
    style={styles.card}
    onPress={() => onPress(polyrhythmId)}
    accessibilityRole="button"
    accessibilityLabel={`${name} progress card. ${sessionCount} sessions.`}
    accessibilityHint="Opens session history for this polyrhythm"
    testID={testID}
  >
    <View style={styles.header}>
      <Text variant="h3" color={colors.textPrimary}>
        {name}
      </Text>
      <ThreeStateIndicator
        currentState={currentFeelState}
        testID={testID ? `${testID}-indicator` : undefined}
      />
    </View>
    <View style={styles.meta}>
      <Text variant="caption" color={colors.textSecondary}>
        {lastPracticedAt ? `Last: ${formatRelativeDate(lastPracticedAt)}` : 'Not practiced yet'}
      </Text>
      <Text variant="caption" color={colors.textMuted}>
        {sessionCount} {sessionCount === 1 ? 'session' : 'sessions'}
      </Text>
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export { PolyrhythmCard };
export type { PolyrhythmCardProps };
