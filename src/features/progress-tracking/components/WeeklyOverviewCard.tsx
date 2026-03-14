import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Icon } from '@design-system';
import { colors, spacing, borderRadius } from '@design-system/tokens';
import type { FeelStateChange } from '../types';
import { FEEL_STATE_CONFIG } from '../constants';
import { getWeekRangeLabel } from '../utils';

type WeeklyOverviewCardProps = {
  readonly totalMinutes: number;
  readonly sessionCount: number;
  readonly polyrhythmsVisited: string[];
  readonly streak: number;
  readonly feelStateChanges: FeelStateChange[];
  readonly testID?: string;
};

/**
 * Summary card showing this week's practice metrics and feel state changes.
 * Displayed at the top of the Progress tab.
 */
const WeeklyOverviewCard = ({
  totalMinutes,
  sessionCount,
  polyrhythmsVisited,
  streak,
  feelStateChanges,
  testID,
}: WeeklyOverviewCardProps) => {
  const weekRange = getWeekRangeLabel();

  return (
    <View style={styles.card} testID={testID}>
      <Text variant="h4" color={colors.textPrimary}>
        This Week ({weekRange})
      </Text>

      <View style={styles.metricsRow}>
        <MetricItem
          icon="clock-outline"
          value={`${totalMinutes} min`}
          label="practice"
          testID={testID ? `${testID}-minutes` : undefined}
        />
        <MetricItem
          icon="counter"
          value={String(sessionCount)}
          label={sessionCount === 1 ? 'session' : 'sessions'}
          testID={testID ? `${testID}-sessions` : undefined}
        />
        <MetricItem
          icon="fire"
          value={streak > 0 ? `${streak}-day` : '0'}
          label="streak"
          testID={testID ? `${testID}-streak` : undefined}
        />
      </View>

      {polyrhythmsVisited.length > 0 && (
        <View style={styles.polyrhythmsRow}>
          <Icon name="music-note" size={16} color={colors.textSecondary} decorative />
          <Text variant="bodySmall" color={colors.textSecondary}>
            {polyrhythmsVisited.join(', ')}
          </Text>
        </View>
      )}

      {feelStateChanges.length > 0 && (
        <View style={styles.changesSection}>
          {feelStateChanges.map((change) => (
            <FeelStateChangeCallout key={change.polyrhythmId} change={change} />
          ))}
        </View>
      )}

      {/* P2 stub: AI narrative summary placeholder */}
      {/* When implemented, show AI-generated coaching narrative below metrics */}
    </View>
  );
};

type MetricItemProps = {
  readonly icon: string;
  readonly value: string;
  readonly label: string;
  readonly testID?: string;
};

const MetricItem = ({ icon, value, label, testID }: MetricItemProps) => (
  <View style={styles.metricItem} testID={testID}>
    <Icon name={icon} size={20} color={colors.textSecondary} decorative />
    <Text variant="h3" color={colors.textPrimary}>
      {value}
    </Text>
    <Text variant="caption" color={colors.textSecondary}>
      {label}
    </Text>
  </View>
);

type FeelStateChangeCalloutProps = {
  readonly change: FeelStateChange;
};

const FeelStateChangeCallout = ({ change }: FeelStateChangeCalloutProps) => {
  const fromLabel = FEEL_STATE_CONFIG[change.from].label;
  const toLabel = FEEL_STATE_CONFIG[change.to].label;
  const toColor = FEEL_STATE_CONFIG[change.to].color;

  // Determine if this is a regression (feeling->hearing, feeling->executing, hearing->executing)
  const stateOrder = { executing: 0, hearing: 1, feeling: 2 };
  const isRegression = stateOrder[change.to] < stateOrder[change.from];

  const message = isRegression
    ? `${change.polyrhythmId} moved from ${fromLabel} to ${toLabel} -- that's normal, keep going`
    : `${change.polyrhythmId} moved from ${fromLabel} to ${toLabel} this week`;

  return (
    <View style={styles.changeCallout}>
      <View style={[styles.changeDot, { backgroundColor: toColor }]} />
      <Text variant="bodySmall" color={colors.textSecondary}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
    gap: spacing.xxs,
  },
  polyrhythmsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  changesSection: {
    gap: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  changeCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  changeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export { WeeklyOverviewCard };
export type { WeeklyOverviewCardProps };
