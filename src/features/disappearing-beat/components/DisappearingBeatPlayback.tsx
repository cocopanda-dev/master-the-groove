// src/features/disappearing-beat/components/DisappearingBeatPlayback.tsx
import React, { useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from '@design-system';
import { colors } from '@design-system/tokens/colors';
import { spacing } from '@design-system/tokens/spacing';
import { useDisappearingBeatEngine } from '../hooks/use-disappearing-beat-engine';
import { useDriftTracker } from '../hooks/use-drift-tracker';
import { StageIndicator } from './StageIndicator';
import { VolumeIndicator } from './VolumeIndicator';
import { TapTarget } from './TapTarget';
import type { StageConfig, DisappearingBeatResult } from '../types';

type DisappearingBeatPlaybackProps = {
  readonly config: StageConfig;
  readonly onComplete: (result: DisappearingBeatResult) => void;
  readonly onStop: () => void;
};

export const DisappearingBeatPlayback = ({
  config,
  onComplete,
  onStop,
}: DisappearingBeatPlaybackProps) => {
  const {
    stage,
    barCount,
    volumeA,
    volumeB,
    start,
    stop,
    onDriftResult,
  } = useDisappearingBeatEngine(config, onComplete);

  const { recordTap, computeDrift, reset: resetDrift } = useDriftTracker(config, stage);

  // Start engine on mount
  useEffect(() => {
    start();
    return () => {
      resetDrift();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When leaving stage 3, compute and report drift
  const prevStageRef = React.useRef(stage);
  useEffect(() => {
    if (prevStageRef.current === 'stage3' && stage !== 'stage3') {
      const drift = computeDrift();
      onDriftResult(drift);
    }
    prevStageRef.current = stage;
  }, [stage, computeDrift, onDriftResult]);

  const handleTap = useCallback(
    (timestamp: number) => {
      recordTap(timestamp);
    },
    [recordTap],
  );

  const handleStop = useCallback(() => {
    // Compute drift if we're in stage 3
    if (stage === 'stage3') {
      const drift = computeDrift();
      onDriftResult(drift);
    }
    stop();
    onStop();
  }, [stage, computeDrift, onDriftResult, stop, onStop]);

  return (
    <View style={styles.container}>
      <StageIndicator
        stage={stage}
        barCount={barCount}
        barsPerStage={config.barsPerStage}
      />

      <View style={styles.volumeSection}>
        <VolumeIndicator label="Layer A" volume={volumeA} color={colors.layerA} />
        <VolumeIndicator label="Layer B" volume={volumeB} color={colors.layerB} />
      </View>

      <View style={styles.centerSection}>
        {stage === 'stage3' ? (
          <TapTarget stage={stage} onTap={handleTap} />
        ) : (
          <View style={styles.placeholder}>
            <Text variant="body" color={colors.textSecondary} align="center">
              {stage === 'warmup' && 'Listen and lock in...'}
              {stage === 'stage1' && 'Layer fading...'}
              {stage === 'stage2' && 'Almost gone...'}
              {stage === 'return' && 'Welcome back!'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.infoRow}>
        <Text variant="caption" color={colors.textMuted}>
          {config.ratioA}:{config.ratioB} at {config.bpm} BPM
        </Text>
        <Text variant="caption" color={colors.textMuted}>
          Target: Layer {config.targetLayer}
        </Text>
      </View>

      <Button
        accessibilityLabel="Stop session"
        onPress={handleStop}
        variant="ghost"
        size="md"
      >
        Stop
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  volumeSection: {
    gap: spacing.sm,
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
