// src/features/baby-mode/components/ParentalGate.tsx
import React, { useCallback, useRef, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from '@design-system';
import { colors } from '@design-system/tokens';

const HOLD_DURATION_MS = 2000;

interface ParentalGateProps {
  /** Called when both circles are successfully held for 2 seconds */
  readonly onUnlock: () => void;
}

/**
 * Parental gate requiring simultaneous 2-second hold on two circles.
 * Designed to be too complex for toddlers. Resets silently on release
 * to avoid confusing the child.
 */
const ParentalGate = ({ onUnlock }: ParentalGateProps) => {
  const [leftPressed, setLeftPressed] = useState(false);
  const [rightPressed, setRightPressed] = useState(false);
  const [progress, setProgress] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    startTimeRef.current = null;
    setProgress(0);
  }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current !== null) return;
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      if (startTimeRef.current === null) return;
      const elapsed = Date.now() - startTimeRef.current;
      const p = Math.min(elapsed / HOLD_DURATION_MS, 1);
      setProgress(p);

      if (elapsed >= HOLD_DURATION_MS) {
        if (timerRef.current !== null) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        onUnlock();
      }
    }, 50);
  }, [onUnlock]);

  const checkBothPressed = useCallback(
    (left: boolean, right: boolean) => {
      if (left && right) {
        startTimer();
      } else {
        clearTimer();
      }
    },
    [startTimer, clearTimer],
  );

  const onLeftIn = useCallback(() => {
    setLeftPressed(true);
    checkBothPressed(true, rightPressed);
  }, [checkBothPressed, rightPressed]);

  const onLeftOut = useCallback(() => {
    setLeftPressed(false);
    checkBothPressed(false, rightPressed);
  }, [checkBothPressed, rightPressed]);

  const onRightIn = useCallback(() => {
    setRightPressed(true);
    checkBothPressed(leftPressed, true);
  }, [checkBothPressed, leftPressed]);

  const onRightOut = useCallback(() => {
    setRightPressed(false);
    checkBothPressed(leftPressed, false);
  }, [checkBothPressed, leftPressed]);

  return (
    <View style={styles.container}>
      <Text variant="h3" color={colors.babyTextPrimary} align="center">
        Hold both circles for 2 seconds
      </Text>
      <View style={styles.circleRow}>
        <Pressable
          testID="parental-gate-left"
          accessibilityLabel="Left circle"
          accessibilityRole="button"
          onPressIn={onLeftIn}
          onPressOut={onLeftOut}
          style={[
            styles.circle,
            leftPressed && styles.circlePressed,
          ]}
        />
        <Pressable
          testID="parental-gate-right"
          accessibilityLabel="Right circle"
          accessibilityRole="button"
          onPressIn={onRightIn}
          onPressOut={onRightOut}
          style={[
            styles.circle,
            rightPressed && styles.circlePressed,
          ]}
        />
      </View>
      {progress > 0 && (
        <View style={styles.progressBarContainer}>
          <View
            testID="parental-gate-progress"
            style={[styles.progressBar, { width: `${progress * 100}%` }]}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.babyBackground,
    padding: 32,
  },
  circleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 48,
    marginTop: 32,
  },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.babyPrimary,
    opacity: 0.6,
  },
  circlePressed: {
    opacity: 1,
    backgroundColor: colors.babyAccent,
  },
  progressBarContainer: {
    width: '60%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginTop: 24,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.babyAccent,
    borderRadius: 4,
  },
});

export { ParentalGate };
export type { ParentalGateProps };
