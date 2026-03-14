// src/features/baby-mode/components/ParentalGate.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from '@design-system';
import { colors, spacing } from '@design-system/tokens';
import { PARENTAL_GATE_HOLD_MS } from '../constants';

interface ParentalGateProps {
  readonly onPass: () => void;
  readonly onCancel: () => void;
}

export const ParentalGate = ({ onPass, onCancel }: ParentalGateProps) => {
  const [leftHeld, setLeftHeld] = useState(false);
  const [rightHeld, setRightHeld] = useState(false);
  const leftRef = useRef(false);
  const rightRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const passedRef = useRef(false);

  // Clean up hold timer on unmount to prevent firing onPass after unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const checkBothHeld = useCallback(() => {
    if (leftRef.current && rightRef.current && !passedRef.current) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        passedRef.current = true;
        onPass();
      }, PARENTAL_GATE_HOLD_MS);
    } else if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [onPass]);

  const onLeftPressIn = useCallback(() => {
    leftRef.current = true;
    setLeftHeld(true);
    checkBothHeld();
  }, [checkBothHeld]);

  const onLeftPressOut = useCallback(() => {
    leftRef.current = false;
    setLeftHeld(false);
    checkBothHeld();
  }, [checkBothHeld]);

  const onRightPressIn = useCallback(() => {
    rightRef.current = true;
    setRightHeld(true);
    checkBothHeld();
  }, [checkBothHeld]);

  const onRightPressOut = useCallback(() => {
    rightRef.current = false;
    setRightHeld(false);
    checkBothHeld();
  }, [checkBothHeld]);

  return (
    <View style={styles.overlay} testID="parental-gate">
      <View style={styles.content}>
        <Text variant="h3" color={colors.babyTextPrimary} align="center">
          Parent Check
        </Text>
        <Text variant="body" color={colors.babyTextSecondary} align="center">
          Hold both circles for 2 seconds to exit Baby Mode
        </Text>
        <View style={styles.circleRow}>
          <Pressable
            testID="parental-gate-left"
            onPressIn={onLeftPressIn}
            onPressOut={onLeftPressOut}
            style={[styles.circle, leftHeld && styles.circleActive]}
            accessibilityLabel="Left hold circle"
            accessibilityRole="button"
          />
          <Pressable
            testID="parental-gate-right"
            onPressIn={onRightPressIn}
            onPressOut={onRightPressOut}
            style={[styles.circle, rightHeld && styles.circleActive]}
            accessibilityLabel="Right hold circle"
            accessibilityRole="button"
          />
        </View>
        <Pressable
          onPress={onCancel}
          style={styles.cancelButton}
          accessibilityLabel="Cancel"
          accessibilityRole="button"
          testID="parental-gate-cancel"
        >
          <Text variant="body" color={colors.babyPrimary}>
            Cancel
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const CIRCLE_SIZE = 80;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  content: {
    backgroundColor: colors.babySurface,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.lg,
    width: '80%',
    maxWidth: 320,
  },
  circleRow: {
    flexDirection: 'row',
    gap: spacing['2xl'],
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 3,
    borderColor: colors.babyPrimary,
    backgroundColor: 'transparent',
  },
  circleActive: {
    backgroundColor: colors.babyPrimary,
  },
  cancelButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
});
