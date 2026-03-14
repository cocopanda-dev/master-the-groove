// src/features/baby-mode/components/StageBanner.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@design-system';
import { colors, spacing } from '@design-system/tokens';
import type { BabyStageInfo } from '../types';

interface StageBannerProps {
  readonly stageInfo: BabyStageInfo;
  readonly babyName: string;
  readonly ageMonths: number;
}

export const StageBanner = ({ stageInfo, babyName, ageMonths }: StageBannerProps) => {
  const ageText = ageMonths >= 12
    ? `${Math.floor(ageMonths / 12)}y ${ageMonths % 12}m`
    : `${ageMonths}m`;

  return (
    <View style={styles.container} testID="stage-banner">
      <Text variant="h3" color={colors.babyTextPrimary}>
        Stage {stageInfo.stage}: {stageInfo.name}
      </Text>
      <Text variant="body" color={colors.babyTextSecondary}>
        {babyName} - {ageText} ({stageInfo.ageRange})
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.babySurface,
    borderRadius: 12,
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
});
