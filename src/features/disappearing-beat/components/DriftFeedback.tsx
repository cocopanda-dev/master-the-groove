// src/features/disappearing-beat/components/DriftFeedback.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@design-system';
import { colors } from '@design-system/tokens/colors';
import { spacing } from '@design-system/tokens/spacing';
import { borderRadius } from '@design-system/tokens/border-radius';

type DriftZone = 'locked-in' | 'close' | 'drifting' | 'missed';

type DriftFeedbackProps = {
  readonly driftMs: number | null;
  readonly zone: DriftZone;
};

const ZONE_COLORS: Record<DriftZone, string> = {
  'locked-in': colors.driftLockedIn,
  close: colors.driftClose,
  drifting: colors.driftDrifting,
  missed: colors.textMuted,
};

const ZONE_LABELS: Record<DriftZone, string> = {
  'locked-in': 'Locked In',
  close: 'Close',
  drifting: 'Drifting',
  missed: 'Missed',
};

const getArrowDirection = (driftMs: number | null): string => {
  if (driftMs === null) return '--';
  if (driftMs < 0) return 'Early';
  if (driftMs > 0) return 'Late';
  return 'On time';
};

const getArrowSymbol = (driftMs: number | null): string => {
  if (driftMs === null) return '';
  if (driftMs < 0) return '<';
  if (driftMs > 0) return '>';
  return '=';
};

export const DriftFeedback = ({ driftMs, zone }: DriftFeedbackProps) => {
  const zoneColor = ZONE_COLORS[zone];
  const zoneLabel = ZONE_LABELS[zone];
  const direction = getArrowDirection(driftMs);
  const arrow = getArrowSymbol(driftMs);
  const magnitude = driftMs !== null ? `${Math.abs(Math.round(driftMs))}ms` : '--';

  return (
    <View
      style={[styles.container, { borderColor: zoneColor }]}
      accessibilityRole="text"
      accessibilityLabel={`Drift: ${magnitude} ${direction}. Zone: ${zoneLabel}`}
    >
      <View style={styles.arrowRow}>
        {arrow !== '' && (
          <Text variant="h2" color={zoneColor}>{arrow}</Text>
        )}
        <Text variant="h3" color={zoneColor}>
          {magnitude}
        </Text>
      </View>
      <Text variant="body" color={zoneColor}>
        {direction}
      </Text>
      <View style={[styles.zoneBadge, { backgroundColor: zoneColor }]}>
        <Text variant="bodySmall" color={colors.background}>
          {zoneLabel}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderWidth: 2,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
  },
  arrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  zoneBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
});
