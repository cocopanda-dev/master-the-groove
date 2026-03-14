// src/features/baby-mode/components/DuetTapScreen.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Text } from '@design-system';
import { colors, spacing } from '@design-system/tokens';
import { useBabyStore } from '@data-access/stores';
import { playSound } from '@libs/audio';
import {
  BABY_BPM_DEFAULT,
  BABY_BPM_MIN,
  BABY_BPM_MAX,
  CELEBRATION_WINDOW_MS,
  capBabyVolume,
} from '../constants';
import { useBabySessionTimer } from '../hooks/use-baby-session-timer';
import { BabyResponsePrompt } from './BabyResponsePrompt';

interface DuetTapScreenComponentProps {
  readonly babyProfileId: string;
  readonly babyName: string;
  readonly onClose: () => void;
}

export const DuetTapScreenComponent = ({
  babyProfileId,
  babyName,
  onClose,
}: DuetTapScreenComponentProps) => {
  const [bpm, setBpm] = useState(BABY_BPM_DEFAULT);
  const [parentRipple, setParentRipple] = useState(false);
  const [babyRipple, setBabyRipple] = useState(false);
  const [celebration, setCelebration] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [beatPulse, setBeatPulse] = useState(false);

  const lastParentTap = useRef(0);
  const lastBabyTap = useRef(0);
  const startTime = useRef(Date.now());
  const beatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isFocused = useIsFocused();
  const timer = useBabySessionTimer();
  const logBabySession = useBabyStore((s) => s.logBabySession);

  const babyVolume = capBabyVolume(0.4);

  // Start timer on mount
  useEffect(() => {
    startTime.current = Date.now();
    timer.start();
    return () => {
      timer.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Background beat via setInterval — only when screen is focused
  useEffect(() => {
    if (!isFocused) {
      if (beatIntervalRef.current) {
        clearInterval(beatIntervalRef.current);
        beatIntervalRef.current = null;
      }
      return;
    }

    const interval = (60 / bpm) * 1000;
    beatIntervalRef.current = setInterval(() => {
      setBeatPulse(true);
      playSound('woodblock', babyVolume, 0).catch(() => {});
      setTimeout(() => setBeatPulse(false), 100);
    }, interval);

    return () => {
      if (beatIntervalRef.current) {
        clearInterval(beatIntervalRef.current);
        beatIntervalRef.current = null;
      }
    };
  }, [bpm, isFocused, babyVolume]);

  const checkCelebration = useCallback((parentTime: number, babyTime: number) => {
    if (Math.abs(parentTime - babyTime) <= CELEBRATION_WINDOW_MS) {
      setCelebration(true);
      setTimeout(() => setCelebration(false), 500);
    }
  }, []);

  const onParentTap = useCallback(() => {
    const now = Date.now();
    lastParentTap.current = now;
    playSound('click', babyVolume, 0).catch(() => {});
    setParentRipple(true);
    setTimeout(() => setParentRipple(false), 300);
    if (lastBabyTap.current > 0) {
      checkCelebration(now, lastBabyTap.current);
    }
  }, [checkCelebration]);

  const onBabyTap = useCallback(() => {
    const now = Date.now();
    lastBabyTap.current = now;
    playSound('clave', babyVolume, 0).catch(() => {});
    setBabyRipple(true);
    setTimeout(() => setBabyRipple(false), 300);
    if (lastParentTap.current > 0) {
      checkCelebration(lastParentTap.current, now);
    }
  }, [checkCelebration]);

  const handleDone = useCallback(() => {
    timer.stop();
    setShowResponse(true);
  }, [timer]);

  const handleResponse = useCallback(
    (response: 'calm' | 'excited' | 'disengaged' | null) => {
      const duration = Math.round((Date.now() - startTime.current) / 1000);
      logBabySession({
        babyProfileId,
        activityType: 'duet-tap',
        duration,
        babyResponse: response,
        completedAt: new Date().toISOString(),
      });
      setShowResponse(false);
      onClose();
    },
    [babyProfileId, logBabySession, onClose],
  );

  // Auto-finish when timer expires
  useEffect(() => {
    if (timer.status === 'expired') {
      handleDone();
    }
  }, [timer.status, handleDone]);

  if (showResponse) {
    return <BabyResponsePrompt babyName={babyName} onResponse={handleResponse} />;
  }

  return (
    <View style={styles.container} testID="duet-tap-screen">
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={handleDone}
          style={styles.closeButton}
          accessibilityLabel="Close"
          accessibilityRole="button"
          testID="duet-tap-close"
        >
          <Text variant="h4" color={colors.babyTextSecondary}>
            X
          </Text>
        </Pressable>

        <View style={styles.bpmControl}>
          <Pressable
            onPress={() => setBpm((b) => Math.max(BABY_BPM_MIN, b - 5))}
            style={styles.bpmButton}
            accessibilityLabel="Decrease BPM"
            accessibilityRole="button"
            testID="bpm-decrease"
          >
            <Text variant="body" color={colors.babyTextPrimary}>-</Text>
          </Pressable>
          <Text variant="body" color={colors.babyTextPrimary} testID="bpm-display">
            {bpm} BPM
          </Text>
          <Pressable
            onPress={() => setBpm((b) => Math.min(BABY_BPM_MAX, b + 5))}
            style={styles.bpmButton}
            accessibilityLabel="Increase BPM"
            accessibilityRole="button"
            testID="bpm-increase"
          >
            <Text variant="body" color={colors.babyTextPrimary}>+</Text>
          </Pressable>
        </View>

        {timer.status === 'warning' && (
          <Text variant="bodySmall" color={colors.warning}>
            {timer.remaining}s remaining
          </Text>
        )}
      </View>

      {/* Celebration overlay */}
      {celebration && (
        <View style={styles.celebrationOverlay} testID="celebration-burst">
          <Text variant="h2" color={colors.babyCelebration}>
            Great teamwork!
          </Text>
        </View>
      )}

      {/* Tap zones */}
      <View style={styles.tapZones}>
        <Pressable
          onPress={onParentTap}
          style={[
            styles.tapZone,
            styles.parentZone,
            parentRipple && styles.tapZoneRipple,
            beatPulse && styles.tapZoneBeat,
          ]}
          accessibilityLabel="Parent tap zone"
          accessibilityRole="button"
          testID="parent-tap-zone"
        >
          <Text variant="h3" color={colors.babySurface}>
            Parent
          </Text>
        </Pressable>

        <Pressable
          onPress={onBabyTap}
          style={[
            styles.tapZone,
            styles.babyZone,
            babyRipple && styles.tapZoneRipple,
            beatPulse && styles.tapZoneBeat,
          ]}
          accessibilityLabel="Baby tap zone"
          accessibilityRole="button"
          testID="baby-tap-zone"
        >
          <Text variant="h3" color={colors.babySurface}>
            Baby
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.babyBackground,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    paddingTop: spacing.xl,
  },
  closeButton: {
    padding: spacing.sm,
  },
  bpmControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  bpmButton: {
    width: spacing.tapMinimumBaby,
    height: spacing.tapMinimumBaby,
    borderRadius: spacing.tapMinimumBaby / 2,
    backgroundColor: colors.babySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapZones: {
    flex: 1,
    gap: spacing.md,
    padding: spacing.md,
  },
  tapZone: {
    flex: 1,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: spacing.tapMinimumBaby,
  },
  parentZone: {
    backgroundColor: colors.babyTapZoneA,
  },
  babyZone: {
    backgroundColor: colors.babyTapZoneB,
  },
  tapZoneRipple: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
  tapZoneBeat: {
    opacity: 0.85,
  },
  celebrationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
});
