import React, { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@design-system/tokens/colors';
import { useSessionStore } from '@data-access/stores';
import { useShallow } from 'zustand/shallow';
import {
  DisappearingBeatConfigScreen,
  DisappearingBeatPlayback,
  DisappearingBeatResults,
} from '@features/disappearing-beat';
import type { StageConfig, DisappearingBeatResult } from '@features/disappearing-beat';

type ScreenPhase = 'config' | 'playing' | 'results';

const DisappearingBeatScreen = () => {
  const router = useRouter();
  const [phase, setPhase] = useState<ScreenPhase>('config');
  const [config, setConfig] = useState<StageConfig | null>(null);
  const [result, setResult] = useState<DisappearingBeatResult | null>(null);

  const { startSession, updateSession, endSession, completeSession } = useSessionStore(
    useShallow((s) => ({
      startSession: s.startSession,
      updateSession: s.updateSession,
      endSession: s.endSession,
      completeSession: s.completeSession,
    })),
  );

  const handleStart = useCallback(
    (cfg: StageConfig) => {
      setConfig(cfg);
      setPhase('playing');

      startSession({
        polyrhythmId: `${cfg.ratioA}-${cfg.ratioB}`,
        mode: 'disappearing-beat',
        bpm: cfg.bpm,
      });
    },
    [startSession],
  );

  const handleComplete = useCallback(
    (completedResult: DisappearingBeatResult) => {
      setResult(completedResult);
      setPhase('results');

      // Update session with disappearing beat data
      updateSession({
        disappearingBeatStageReached: completedResult.highestStage,
      });

      // End session (feel state will be handled separately or skipped)
      endSession(null);
      completeSession();
    },
    [updateSession, endSession, completeSession],
  );

  const handleStop = useCallback(() => {
    // The onComplete callback in the engine handles session recording
    setPhase('results');
  }, []);

  const handleTryAgain = useCallback(() => {
    if (config) {
      setResult(null);
      setPhase('playing');

      startSession({
        polyrhythmId: `${config.ratioA}-${config.ratioB}`,
        mode: 'disappearing-beat',
        bpm: config.bpm,
      });
    }
  }, [config, startSession]);

  const handleAdjustSettings = useCallback(() => {
    setResult(null);
    setPhase('config');
  }, []);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <View style={styles.container}>
      {phase === 'config' && (
        <DisappearingBeatConfigScreen onStart={handleStart} />
      )}
      {phase === 'playing' && config && (
        <DisappearingBeatPlayback
          config={config}
          onComplete={handleComplete}
          onStop={handleStop}
        />
      )}
      {phase === 'results' && result && (
        <DisappearingBeatResults
          result={result}
          onTryAgain={handleTryAgain}
          onAdjustSettings={handleAdjustSettings}
          onBack={handleBack}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

export default DisappearingBeatScreen;
