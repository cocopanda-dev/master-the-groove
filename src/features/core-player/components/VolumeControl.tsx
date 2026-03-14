// src/features/core-player/components/VolumeControl.tsx
import React from 'react';
import { View, Pressable, StyleSheet, Text } from 'react-native';
import { Slider } from '@design-system';
import { colors } from '@design-system/tokens/colors';
import { spacing } from '@design-system/tokens/spacing';
import { borderRadius } from '@design-system/tokens/border-radius';
import { fontSize } from '@design-system/tokens/typography';
import { LAYER_COLORS } from '../constants';
import type { LayerId } from '../types';

type VolumeControlProps = {
  layerId: LayerId;
  volume: number;
  muted: boolean;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
};

export const VolumeControl = ({
  layerId,
  volume,
  muted,
  onVolumeChange,
  onMuteToggle,
}: VolumeControlProps) => {
  const layerColor = LAYER_COLORS[layerId];
  const displayPercent = Math.round(volume * 100);

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <View style={[styles.layerDot, { backgroundColor: layerColor }]} />
        <Text style={styles.layerLabel}>Layer {layerId}</Text>
        <Text style={styles.percentLabel}>{displayPercent}%</Text>
        <Pressable
          onPress={onMuteToggle}
          accessibilityLabel={muted ? `Unmute Layer ${layerId}` : `Mute Layer ${layerId}`}
          accessibilityRole="button"
          accessibilityState={{ checked: muted }}
          style={[styles.muteButton, muted && styles.muteButtonActive]}
          testID={`mute-button-${layerId}`}
        >
          <Text style={[styles.muteIcon, muted && styles.muteIconActive]}>
            {muted ? '🔇' : '🔊'}
          </Text>
        </Pressable>
      </View>
      <Slider
        value={muted ? 0 : volume}
        onValueChange={(val) => {
          if (muted) return;
          onVolumeChange(val);
        }}
        minimumValue={0}
        maximumValue={1}
        step={0.01}
        minimumTrackTintColor={layerColor}
        maximumTrackTintColor={colors.border}
        thumbTintColor={layerColor}
        disabled={muted}
        accessibilityLabel={`Volume for Layer ${layerId}: ${displayPercent} percent`}
        testID={`volume-slider-${layerId}`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
  percentLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    minWidth: 32,
    textAlign: 'right',
  },
  muteButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  muteButtonActive: {
    backgroundColor: colors.surfaceLight,
  },
  muteIcon: {
    fontSize: 16,
  },
  muteIconActive: {
    opacity: 0.6,
  },
});
