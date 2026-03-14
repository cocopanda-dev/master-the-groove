// src/features/disappearing-beat/components/TapTarget.tsx
import React, { useCallback, useEffect, useRef } from 'react';
import { Pressable, Animated, StyleSheet, View } from 'react-native';
import { Text } from '@design-system';
import { colors } from '@design-system/tokens/colors';
import { TAP_TARGET_SIZE } from '../constants';
import type { DisappearingBeatStage } from '../types';

type TapTargetProps = {
  readonly stage: DisappearingBeatStage;
  readonly onTap: (timestamp: number) => void;
};

export const TapTarget = ({ stage, onTap }: TapTargetProps) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;

  const isVisible = stage === 'stage3';

  // Gentle pulse animation
  useEffect(() => {
    if (!isVisible) {
      pulseAnim.setValue(1);
      return;
    }

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();

    return () => pulse.stop();
  }, [isVisible, pulseAnim]);

  const handlePress = useCallback(
    (e?: { nativeEvent?: { timestamp?: number } }) => {
      // Best-precision timestamp: nativeEvent.timestamp > performance.now() > Date.now()
      const timestamp =
        e?.nativeEvent?.timestamp ?? performance.now();

      onTap(timestamp);

      // Flash feedback
      flashAnim.setValue(1);
      Animated.timing(flashAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    },
    [onTap, flashAnim],
  );

  if (!isVisible) return null;

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }] }]}>
        <Pressable
          onPress={handlePress}
          style={styles.target}
          accessibilityRole="button"
          accessibilityLabel="Tap beat 1"
          accessibilityHint="Tap when you feel beat 1"
        >
          <Animated.View style={[styles.flash, { opacity: flashAnim }]} />
          <Text variant="h4" align="center" color={colors.textPrimary}>
            Tap{'\n'}Beat 1
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
};

const TARGET_OUTER = TAP_TARGET_SIZE + 20;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  pulseRing: {
    width: TARGET_OUTER,
    height: TARGET_OUTER,
    borderRadius: TARGET_OUTER / 2,
    borderWidth: 2,
    borderColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  target: {
    width: TAP_TARGET_SIZE,
    height: TAP_TARGET_SIZE,
    borderRadius: TAP_TARGET_SIZE / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primaryLight,
    borderRadius: TAP_TARGET_SIZE / 2,
  },
});
