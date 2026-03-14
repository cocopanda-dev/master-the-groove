// src/features/feel-lessons/components/StepNavigation.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from '@design-system';
import { spacing } from '@design-system/tokens';

interface StepNavigationProps {
  readonly canGoBack: boolean;
  readonly canGoNext: boolean;
  readonly onBack: () => void;
  readonly onNext: () => void;
  readonly isLastStep: boolean;
}

export const StepNavigation = ({
  canGoBack,
  canGoNext,
  onBack,
  onNext,
  isLastStep,
}: StepNavigationProps) => (
  <View style={styles.container}>
    <Button
      accessibilityLabel="Go back to previous step"
      onPress={onBack}
      variant="ghost"
      disabled={!canGoBack}
    >
      Back
    </Button>
    <Button
      accessibilityLabel={isLastStep ? 'Complete lesson' : 'Go to next step'}
      onPress={onNext}
      variant="primary"
      disabled={!canGoNext}
    >
      {isLastStep ? 'Done' : 'Next'}
    </Button>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
});
