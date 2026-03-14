import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@design-system';
import { colors, spacing } from '@design-system/tokens';
import type { PolyrhythmProgress } from '../types';
import { PolyrhythmCard } from './PolyrhythmCard';
import { EmptyState } from './EmptyState';

type FeelStatusDashboardProps = {
  readonly polyrhythms: PolyrhythmProgress[];
  readonly onPolyrhythmPress: (polyrhythmId: string) => void;
  readonly testID?: string;
};

/**
 * Grid of polyrhythm cards showing current feel states.
 * Ordered by most recently practiced.
 * Shows empty state when no polyrhythms have been practiced.
 */
const FeelStatusDashboard = ({
  polyrhythms,
  onPolyrhythmPress,
  testID,
}: FeelStatusDashboardProps) => {
  if (polyrhythms.length === 0) {
    return (
      <EmptyState
        message="Start a practice session to see your progress here"
        testID={testID ? `${testID}-empty` : undefined}
      />
    );
  }

  return (
    <View style={styles.container} testID={testID}>
      <Text variant="h4" color={colors.textPrimary}>
        Feel Status
      </Text>
      <View style={styles.grid}>
        {polyrhythms.map((poly) => (
          <PolyrhythmCard
            key={poly.polyrhythmId}
            polyrhythmId={poly.polyrhythmId}
            name={poly.name}
            currentFeelState={poly.currentFeelState}
            lastPracticedAt={poly.lastPracticedAt}
            sessionCount={poly.sessionCount}
            onPress={onPolyrhythmPress}
            testID={testID ? `${testID}-card-${poly.polyrhythmId}` : undefined}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  grid: {
    gap: spacing.xs,
  },
});

export { FeelStatusDashboard };
export type { FeelStatusDashboardProps };
