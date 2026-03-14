// src/features/disappearing-beat/components/DisappearingBeatConfigScreen.tsx
import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Text, Button } from '@design-system';
import { colors } from '@design-system/tokens/colors';
import { spacing } from '@design-system/tokens/spacing';
import { borderRadius } from '@design-system/tokens/border-radius';
import { useSettingsStore } from '@data-access/stores';
import type { StageConfig } from '../types';
import {
  DEFAULT_CONFIG,
  POLYRHYTHM_OPTIONS,
  BARS_PER_STAGE_OPTIONS,
  RETURN_CYCLES_OPTIONS,
} from '../constants';

type DisappearingBeatConfigScreenProps = {
  readonly onStart: (config: StageConfig) => void;
};

type SegmentedControlProps<T extends string | number> = {
  readonly label: string;
  readonly options: readonly { readonly value: T; readonly label: string }[];
  readonly selected: T;
  readonly onSelect: (value: T) => void;
};

const SegmentedControl = <T extends string | number>({
  label,
  options,
  selected,
  onSelect,
}: SegmentedControlProps<T>) => (
  <View style={segStyles.container}>
    <Text variant="bodySmall" color={colors.textSecondary}>{label}</Text>
    <View style={segStyles.row}>
      {options.map((opt) => (
        <Pressable
          key={String(opt.value)}
          onPress={() => onSelect(opt.value)}
          style={[
            segStyles.option,
            selected === opt.value && segStyles.optionSelected,
          ]}
          accessibilityRole="button"
          accessibilityState={{ selected: selected === opt.value }}
          accessibilityLabel={`${label}: ${opt.label}`}
        >
          <Text
            variant="bodySmall"
            color={selected === opt.value ? colors.textPrimary : colors.textSecondary}
          >
            {opt.label}
          </Text>
        </Pressable>
      ))}
    </View>
  </View>
);

const segStyles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  option: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    minHeight: spacing.tapMinimum,
    justifyContent: 'center',
  },
  optionSelected: {
    backgroundColor: colors.primaryLight,
  },
});

export const DisappearingBeatConfigScreen = ({
  onStart,
}: DisappearingBeatConfigScreenProps) => {
  const defaultBpm = useSettingsStore((s) => s.defaultBpm);

  const [polyrhythmIndex, setPolyrhythmIndex] = useState(0);
  const [targetLayer, setTargetLayer] = useState<'A' | 'B'>(DEFAULT_CONFIG.targetLayer);
  const [barsPerStage, setBarsPerStage] = useState(DEFAULT_CONFIG.barsPerStage);
  const [returnCycles, setReturnCycles] = useState(DEFAULT_CONFIG.returnCycles);
  const [bpm, setBpm] = useState(defaultBpm);

  const selectedPoly = POLYRHYTHM_OPTIONS[polyrhythmIndex] ?? POLYRHYTHM_OPTIONS[0]!;

  const handleStart = useCallback(() => {
    const config: StageConfig = {
      ratioA: selectedPoly.ratioA,
      ratioB: selectedPoly.ratioB,
      bpm,
      targetLayer,
      barsPerStage,
      returnCycles,
    };
    onStart(config);
  }, [selectedPoly, bpm, targetLayer, barsPerStage, returnCycles, onStart]);

  const incrementBpm = useCallback(() => {
    setBpm((prev) => Math.min(240, prev + 5));
  }, []);

  const decrementBpm = useCallback(() => {
    setBpm((prev) => Math.max(20, prev - 5));
  }, []);

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
    >
      <Text variant="h3" align="center">Configure Session</Text>

      <SegmentedControl
        label="Polyrhythm"
        options={POLYRHYTHM_OPTIONS.map((p, i) => ({ value: i, label: p.label }))}
        selected={polyrhythmIndex}
        onSelect={setPolyrhythmIndex}
      />

      <SegmentedControl
        label="Disappearing Layer"
        options={[
          { value: 'A' as const, label: 'Layer A' },
          { value: 'B' as const, label: 'Layer B' },
        ]}
        selected={targetLayer}
        onSelect={setTargetLayer}
      />

      <SegmentedControl
        label="Bars per Stage"
        options={BARS_PER_STAGE_OPTIONS.map((b) => ({ value: b, label: String(b) }))}
        selected={barsPerStage}
        onSelect={setBarsPerStage}
      />

      <SegmentedControl
        label="Return Cycles"
        options={RETURN_CYCLES_OPTIONS.map((c) => ({ value: c, label: String(c) }))}
        selected={returnCycles}
        onSelect={setReturnCycles}
      />

      <View style={styles.bpmSection}>
        <Text variant="bodySmall" color={colors.textSecondary}>BPM</Text>
        <View style={styles.bpmRow}>
          <Pressable
            onPress={decrementBpm}
            style={styles.bpmButton}
            accessibilityRole="button"
            accessibilityLabel="Decrease BPM"
          >
            <Text variant="h3" color={colors.textPrimary}>-</Text>
          </Pressable>
          <Text variant="h2" align="center">{bpm}</Text>
          <Pressable
            onPress={incrementBpm}
            style={styles.bpmButton}
            accessibilityRole="button"
            accessibilityLabel="Increase BPM"
          >
            <Text variant="h3" color={colors.textPrimary}>+</Text>
          </Pressable>
        </View>
      </View>

      <Button
        accessibilityLabel="Start disappearing beat session"
        onPress={handleStart}
        size="lg"
      >
        Start
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  bpmSection: {
    gap: spacing.sm,
  },
  bpmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  bpmButton: {
    width: spacing.tapMinimum,
    height: spacing.tapMinimum,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
