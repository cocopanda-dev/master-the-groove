// src/features/onboarding/components/GenreChip.tsx
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Text } from '@design-system';
import { colors } from '@design-system/tokens/colors';
import { borderRadius } from '@design-system/tokens/border-radius';

interface GenreChipProps {
  readonly genre: string;
  readonly selected: boolean;
  readonly onToggle: (genre: string) => void;
}

export const GenreChip = ({ genre, selected, onToggle }: GenreChipProps) => (
  <Pressable
    onPress={() => onToggle(genre)}
    accessibilityRole="checkbox"
    accessibilityState={{ checked: selected }}
    accessibilityLabel={genre}
    style={[styles.chip, selected && styles.selected]}
    testID={`genre-chip-${genre}`}
  >
    <Text
      variant="body"
      color={selected ? colors.textPrimary : colors.textSecondary}
    >
      {genre}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  chip: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceLight,
  },
});
