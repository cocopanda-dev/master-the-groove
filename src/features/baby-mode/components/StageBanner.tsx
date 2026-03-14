// src/features/baby-mode/components/StageBanner.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@design-system';
import { colors } from '@design-system/tokens';
import { useBabyStage } from '../hooks/use-baby-stage';

/**
 * Displays the current baby stage, name, and age in a warm banner.
 * E.g., "Stage 2: Pat-a-Cake Mode" / "Luna, 8 months"
 */
const StageBanner = () => {
  const { stage, stageName, babyName, ageInMonths } = useBabyStage();

  return (
    <View style={styles.container} testID="stage-banner">
      <Text variant="h3" color={colors.babyTextPrimary} align="center">
        Stage {stage}: {stageName}
      </Text>
      <Text variant="body" color={colors.babyTextSecondary} align="center">
        {babyName}, {ageInMonths} months
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.babySurface,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginHorizontal: 16,
    marginTop: 16,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
});

export { StageBanner };
