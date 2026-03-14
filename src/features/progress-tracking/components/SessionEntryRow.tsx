import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Icon } from '@design-system';
import { colors, spacing, borderRadius } from '@design-system/tokens';
import type { Session } from '@types';
import { FEEL_STATE_CONFIG, SESSION_MODE_ICONS } from '../constants';
import { formatDuration, formatTime } from '../utils';

type SessionEntryRowProps = {
  readonly session: Session;
  readonly testID?: string;
};

/**
 * Single session row with all metadata:
 * polyrhythm badge, mode icon, duration, BPM range,
 * disappearing beat stage (conditional), feel state dot, timestamp.
 */
const SessionEntryRow = ({ session, testID }: SessionEntryRowProps) => {
  const modeIcon = SESSION_MODE_ICONS[session.mode] ?? 'play-circle';
  const bpmRange =
    session.bpmStart === session.bpmEnd
      ? `${session.bpmStart} BPM`
      : `${session.bpmStart}--${session.bpmEnd} BPM`;

  return (
    <View style={styles.row} testID={testID}>
      <View style={styles.leftSection}>
        {/* Polyrhythm ratio pill */}
        <View style={styles.ratioPill}>
          <Text variant="caption" color={colors.textPrimary}>
            {session.polyrhythmId}
          </Text>
        </View>

        {/* Mode icon */}
        <Icon name={modeIcon} size={18} color={colors.textSecondary} decorative />
      </View>

      <View style={styles.middleSection}>
        {/* Duration */}
        <Text variant="bodySmall" color={colors.textPrimary}>
          {formatDuration(session.duration)}
        </Text>

        {/* BPM range */}
        <Text variant="caption" color={colors.textSecondary}>
          {bpmRange}
        </Text>

        {/* Disappearing beat stage (conditional) */}
        {session.disappearingBeatStageReached > 0 && (
          <Text variant="caption" color={colors.warning}>
            Stage {session.disappearingBeatStageReached}
          </Text>
        )}
      </View>

      <View style={styles.rightSection}>
        {/* Feel state dot */}
        {session.feelStateAfter && (
          <View
            style={[
              styles.feelDot,
              { backgroundColor: FEEL_STATE_CONFIG[session.feelStateAfter].color },
            ]}
            accessibilityLabel={`Feel state: ${FEEL_STATE_CONFIG[session.feelStateAfter].label}`}
          />
        )}

        {/* Timestamp */}
        <Text variant="caption" color={colors.textMuted}>
          {formatTime(session.startedAt)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 80,
  },
  ratioPill: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  middleSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  feelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export { SessionEntryRow };
export type { SessionEntryRowProps };
