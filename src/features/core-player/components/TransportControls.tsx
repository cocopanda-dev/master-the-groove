// src/features/core-player/components/TransportControls.tsx
import React from 'react';
import { View, Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '@design-system/tokens/colors';
import { spacing } from '@design-system/tokens/spacing';
import type { CorePlayerStatus } from '../types';

type TransportControlsProps = {
  status: CorePlayerStatus;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
};

export const TransportControls = ({ status, onPlay, onPause, onStop }: TransportControlsProps) => {
  const isPlaying = status === 'playing';

  const handlePlayPause = () => {
    if (isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  };

  return (
    <View style={styles.container}>
      {/* Stop button */}
      <Pressable
        style={styles.stopButton}
        onPress={onStop}
        accessibilityLabel="Stop"
        accessibilityRole="button"
        accessibilityState={{ disabled: status === 'idle' }}
        disabled={status === 'idle'}
        testID="transport-stop"
      >
        <View style={[styles.stopIcon, status === 'idle' && styles.disabled]} />
      </Pressable>

      {/* Play / Pause button */}
      <Pressable
        style={styles.playButton}
        onPress={handlePlayPause}
        accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
        accessibilityRole="button"
        testID={isPlaying ? 'transport-pause' : 'transport-play'}
      >
        {isPlaying ? (
          <View style={styles.pauseContainer}>
            <View style={styles.pauseBar} />
            <View style={styles.pauseBar} />
          </View>
        ) : (
          <Text style={styles.playTriangle}>{'▶'}</Text>
        )}
      </Pressable>
    </View>
  );
};

const PLAY_SIZE = 64;
const STOP_SIZE = 44;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  playButton: {
    width: PLAY_SIZE,
    height: PLAY_SIZE,
    borderRadius: PLAY_SIZE / 2,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playTriangle: {
    color: colors.textPrimary,
    fontSize: 24,
    marginLeft: 4,
  },
  pauseContainer: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  pauseBar: {
    width: 5,
    height: 22,
    borderRadius: 2,
    backgroundColor: colors.textPrimary,
  },
  stopButton: {
    width: STOP_SIZE,
    height: STOP_SIZE,
    borderRadius: STOP_SIZE / 2,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopIcon: {
    width: 16,
    height: 16,
    borderRadius: 2,
    backgroundColor: colors.textSecondary,
  },
  disabled: {
    opacity: 0.4,
  },
});
