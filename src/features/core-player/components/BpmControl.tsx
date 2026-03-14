// src/features/core-player/components/BpmControl.tsx
import React, { useState, useCallback } from 'react';
import { View, Pressable, StyleSheet, TextInput, Modal, Text } from 'react-native';
import { Slider } from '@design-system';
import { colors } from '@design-system/tokens/colors';
import { spacing } from '@design-system/tokens/spacing';
import { borderRadius } from '@design-system/tokens/border-radius';
import { fontSize } from '@design-system/tokens/typography';

const BPM_MIN = 20;
const BPM_MAX = 240;

type BpmControlProps = {
  bpm: number;
  ratioA: number;
  ratioB: number;
  onBpmChange: (bpm: number) => void;
  onTapTempo: () => void;
};

const computeLayerBpm = (bpm: number, layerBeats: number, ratioA: number, ratioB: number): number => {
  const cycleLength = (ratioA * ratioB) / gcd(ratioA, ratioB); // lcm
  return Math.round((bpm * layerBeats) / cycleLength);
};

const gcd = (a: number, b: number): number => {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const temp = y;
    y = x % y;
    x = temp;
  }
  return x;
};

export const BpmControl = ({ bpm, ratioA, ratioB, onBpmChange, onTapTempo }: BpmControlProps) => {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editValue, setEditValue] = useState('');

  const openEdit = useCallback(() => {
    setEditValue(String(bpm));
    setEditModalVisible(true);
  }, [bpm]);

  const commitEdit = useCallback(() => {
    const parsed = parseInt(editValue, 10);
    if (!isNaN(parsed)) {
      const clamped = Math.max(BPM_MIN, Math.min(BPM_MAX, parsed));
      onBpmChange(clamped);
    }
    setEditModalVisible(false);
  }, [editValue, onBpmChange]);

  const handleSliderChange = useCallback(
    (val: number) => {
      onBpmChange(Math.round(val));
    },
    [onBpmChange],
  );

  return (
    <View style={styles.container}>
      {/* BPM Display */}
      <Pressable
        onPress={openEdit}
        accessibilityLabel={`BPM: ${bpm}, tap to edit`}
        accessibilityRole="button"
        testID="bpm-display"
        style={styles.displayRow}
      >
        <Text style={styles.bpmValue}>{bpm}</Text>
        <Text style={styles.bpmUnit}>BPM</Text>
      </Pressable>

      {/* Per-layer effective BPM */}
      <View style={styles.layerBpmRow} testID="layer-bpm-display">
        <View style={styles.layerBpmItem}>
          <View style={[styles.layerDot, { backgroundColor: colors.layerA }]} />
          <Text style={styles.layerBpmText}>
            {computeLayerBpm(bpm, ratioA, ratioA, ratioB)} BPM
          </Text>
        </View>
        <View style={styles.layerBpmItem}>
          <View style={[styles.layerDot, { backgroundColor: colors.layerB }]} />
          <Text style={styles.layerBpmText}>
            {computeLayerBpm(bpm, ratioB, ratioA, ratioB)} BPM
          </Text>
        </View>
      </View>

      {/* Slider */}
      <Slider
        value={bpm}
        onValueChange={handleSliderChange}
        minimumValue={BPM_MIN}
        maximumValue={BPM_MAX}
        step={1}
        minimumTrackTintColor={colors.primaryLight}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.textPrimary}
        accessibilityLabel={`BPM slider, current value ${bpm}`}
        testID="bpm-slider"
      />

      {/* Tap Tempo */}
      <Pressable
        onPress={onTapTempo}
        accessibilityLabel="Tap tempo"
        accessibilityRole="button"
        accessibilityHint="Tap repeatedly to set BPM from your tapping speed"
        style={styles.tapButton}
        testID="tap-tempo-button"
      >
        <Text style={styles.tapButtonText}>TAP</Text>
      </Pressable>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setEditModalVisible(false)}
          accessibilityLabel="Close BPM editor"
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter BPM</Text>
            <TextInput
              style={styles.modalInput}
              value={editValue}
              onChangeText={setEditValue}
              keyboardType="number-pad"
              maxLength={3}
              autoFocus
              onSubmitEditing={commitEdit}
              accessibilityLabel="BPM input field"
              testID="bpm-input"
            />
            <Pressable
              onPress={commitEdit}
              style={styles.modalConfirm}
              accessibilityLabel="Confirm BPM"
              accessibilityRole="button"
            >
              <Text style={styles.modalConfirmText}>Set</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    paddingHorizontal: spacing.md,
  },
  displayRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  bpmValue: {
    fontSize: fontSize['4xl'],
    color: colors.textPrimary,
    fontWeight: '700',
  },
  bpmUnit: {
    fontSize: fontSize.xl,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  layerBpmRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    marginTop: -spacing.sm,
  },
  layerBpmItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  layerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  layerBpmText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  tapButton: {
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tapButtonText: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: '700',
    letterSpacing: 2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: 220,
    alignItems: 'center',
    gap: spacing.md,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  modalInput: {
    backgroundColor: colors.surfaceLight,
    color: colors.textPrimary,
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    textAlign: 'center',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    width: 120,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalConfirm: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  modalConfirmText: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});
