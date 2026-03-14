// src/features/core-player/components/SoundSelector.tsx
import React, { useRef, useCallback } from 'react';
import { View, Pressable, StyleSheet, Text } from 'react-native';
import { BottomSheetContainer } from '@design-system';
import { colors } from '@design-system/tokens/colors';
import { spacing } from '@design-system/tokens/spacing';
import { borderRadius } from '@design-system/tokens/border-radius';
import { fontSize } from '@design-system/tokens/typography';
import type { BottomSheetContainerRef } from '@design-system';
import { MVP_SOUND_OPTIONS, LAYER_COLORS } from '../constants';
import type { LayerId } from '../types';
import type { SoundId } from '@types';

type SoundSelectorProps = {
  layerId: LayerId;
  selectedSound: SoundId;
  onSoundChange: (sound: SoundId) => void;
};

export const SoundSelector = ({ layerId, selectedSound, onSoundChange }: SoundSelectorProps) => {
  const sheetRef = useRef<BottomSheetContainerRef>(null);
  const layerColor = LAYER_COLORS[layerId];

  const openSheet = useCallback(() => {
    sheetRef.current?.expand();
  }, []);

  const handleSelect = useCallback(
    (sound: SoundId) => {
      onSoundChange(sound);
      sheetRef.current?.close();
    },
    [onSoundChange],
  );

  const selectedLabel =
    MVP_SOUND_OPTIONS.find((s) => s.id === selectedSound)?.label ?? selectedSound;

  return (
    <>
      <Pressable
        onPress={openSheet}
        accessibilityLabel={`Layer ${layerId} sound: ${selectedLabel}, tap to change`}
        accessibilityRole="button"
        style={styles.trigger}
        testID={`sound-selector-${layerId}`}
      >
        <View style={[styles.layerDot, { backgroundColor: layerColor }]} />
        <Text style={styles.layerLabel}>Layer {layerId}</Text>
        <Text style={styles.soundLabel}>{selectedLabel}</Text>
        <Text style={styles.chevron}>{'›'}</Text>
      </Pressable>

      <BottomSheetContainer
        ref={sheetRef}
        snapPoints={['40%']}
        onDismiss={() => { /* nothing */ }}
      >
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Select Sound — Layer {layerId}</Text>
          {MVP_SOUND_OPTIONS.map((option) => (
            <Pressable
              key={option.id}
              onPress={() => handleSelect(option.id)}
              accessibilityLabel={`${option.label} sound`}
              accessibilityRole="button"
              accessibilityState={{ selected: option.id === selectedSound }}
              style={[styles.option, option.id === selectedSound && styles.optionSelected]}
              testID={`sound-option-${layerId}-${option.id}`}
            >
              <Text
                style={[
                  styles.optionText,
                  option.id === selectedSound && styles.optionTextSelected,
                ]}
              >
                {option.label}
              </Text>
              {option.id === selectedSound && (
                <Text style={[styles.checkmark, { color: layerColor }]}>{'✓'}</Text>
              )}
            </Pressable>
          ))}
        </View>
      </BottomSheetContainer>
    </>
  );
};

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  layerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  layerLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '500',
    flex: 1,
  },
  soundLabel: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  chevron: {
    color: colors.textMuted,
    fontSize: fontSize.lg,
  },
  sheetContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  sheetTitle: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionSelected: {
    backgroundColor: colors.surfaceLight,
    borderColor: colors.border,
  },
  optionText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: fontSize.md,
  },
  optionTextSelected: {
    fontWeight: '600',
  },
  checkmark: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
});
