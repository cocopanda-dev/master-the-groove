// src/features/onboarding/components/RhythmCard.tsx
import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { Text } from '@design-system';
import { colors } from '@design-system/tokens/colors';
import { borderRadius } from '@design-system/tokens/border-radius';
import type { RhythmOption } from '../types';

interface RhythmCardProps {
  readonly option: RhythmOption;
  readonly selected: boolean;
  readonly onToggle: (id: string) => void;
}

export const RhythmCard = ({ option, selected, onToggle }: RhythmCardProps) => {
  const isDisabled = !option.available;

  return (
    <Pressable
      onPress={isDisabled ? undefined : () => onToggle(option.id)}
      disabled={isDisabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected, disabled: isDisabled }}
      accessibilityLabel={`${option.name} - ${option.culturalOrigin}${isDisabled ? ', coming soon' : ''}`}
      style={[
        styles.card,
        selected && styles.selected,
        isDisabled && styles.disabled,
      ]}
      testID={`rhythm-card-${option.id}`}
    >
      <Text variant="h3" color={isDisabled ? colors.textMuted : colors.textPrimary}>
        {option.name}
      </Text>
      <Text variant="bodySmall" color={isDisabled ? colors.textMuted : colors.textSecondary}>
        {option.culturalOrigin}
      </Text>
      {isDisabled && (
        <View style={styles.badge}>
          <Text variant="caption" color={colors.textMuted}>
            Coming soon
          </Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    minWidth: 140,
    flex: 1,
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceLight,
  },
  disabled: {
    opacity: 0.5,
  },
  badge: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginTop: 4,
  },
});
