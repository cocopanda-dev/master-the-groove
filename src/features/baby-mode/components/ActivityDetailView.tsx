// src/features/baby-mode/components/ActivityDetailView.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from '@design-system';
import { colors, spacing } from '@design-system/tokens';
import { useBabyStore } from '@data-access/stores';
import type { BabyActivityCard } from '../types';
import { playSound } from '@libs/audio';
import { capBabyVolume } from '../constants';
import { useBabySessionTimer } from '../hooks/use-baby-session-timer';
import { BabyResponsePrompt } from './BabyResponsePrompt';

interface ActivityDetailViewProps {
  readonly card: BabyActivityCard;
  readonly babyProfileId: string;
  readonly babyName: string;
  readonly onClose: () => void;
}

export const ActivityDetailView = ({
  card,
  babyProfileId,
  babyName,
  onClose,
}: ActivityDetailViewProps) => {
  const [isActive, setIsActive] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const activityStartRef = useRef<number>(0);
  const timer = useBabySessionTimer();
  const logBabySession = useBabyStore((s) => s.logBabySession);

  const babyVolume = capBabyVolume(0.4);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = useCallback(() => {
    setIsActive(true);
    activityStartRef.current = Date.now();
    playSound('click', babyVolume, 0).catch(() => {});
    timer.start();
  }, [timer]);

  const handleDone = useCallback(() => {
    timer.stop();
    setIsActive(false);
    setShowResponse(true);
  }, [timer]);

  const handleResponse = useCallback(
    (response: 'calm' | 'excited' | 'disengaged' | null) => {
      const duration = Math.round((Date.now() - activityStartRef.current) / 1000);
      logBabySession({
        babyProfileId,
        activityType: card.activityType,
        duration,
        babyResponse: response,
        completedAt: new Date().toISOString(),
      });
      setShowResponse(false);
      onClose();
    },
    [babyProfileId, card.activityType, logBabySession, onClose],
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
    <View style={styles.container} testID="activity-detail-view">
      <Pressable
        onPress={onClose}
        style={styles.closeButton}
        accessibilityLabel="Close"
        accessibilityRole="button"
        testID="activity-detail-close"
      >
        <Text variant="h4" color={colors.babyTextSecondary}>
          X
        </Text>
      </Pressable>

      <View style={styles.content}>
        <Text variant="h2" color={colors.babyTextPrimary} align="center">
          {card.title}
        </Text>
        <Text variant="body" color={colors.babyTextSecondary} align="center">
          {card.instruction}
        </Text>

        {isActive ? (
          <>
            <View style={styles.timerContainer}>
              <Text variant="h2" color={timer.status === 'warning' ? colors.warning : colors.babyTextPrimary}>
                {formatTime(timer.remaining)}
              </Text>
              <Text variant="bodySmall" color={colors.babyTextSecondary}>
                Elapsed: {formatTime(timer.elapsed)}
              </Text>
            </View>

            {timer.status === 'warning' && !timer.hasExtended && (
              <Pressable
                onPress={timer.extend}
                style={styles.extendButton}
                accessibilityLabel="Extend session"
                accessibilityRole="button"
                testID="extend-button"
              >
                <Text variant="body" color={colors.babySurface}>
                  +1 Min
                </Text>
              </Pressable>
            )}

            <Pressable
              onPress={handleDone}
              style={styles.doneButton}
              accessibilityLabel="Done"
              accessibilityRole="button"
              testID="done-button"
            >
              <Text variant="body" color={colors.babySurface}>
                Done
              </Text>
            </Pressable>
          </>
        ) : (
          <Pressable
            onPress={handleStart}
            style={styles.startButton}
            accessibilityLabel="Start activity"
            accessibilityRole="button"
            testID="start-button"
          >
            <Text variant="h3" color={colors.babySurface}>
              Start
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.babyBackground,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.xl,
    right: spacing.lg,
    zIndex: 10,
    padding: spacing.sm,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  timerContainer: {
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  startButton: {
    backgroundColor: colors.babyPrimary,
    borderRadius: 40,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing['2xl'],
    marginTop: spacing.xl,
    minWidth: 160,
    alignItems: 'center',
  },
  doneButton: {
    backgroundColor: colors.babySecondary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
    minWidth: 120,
    alignItems: 'center',
  },
  extendButton: {
    backgroundColor: colors.babyPrimary,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
});
