// src/features/baby-mode/components/BabyVisualizerScreen.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';
import { Text } from '@design-system';
import { colors } from '@design-system/tokens';
import { useRouter } from 'expo-router';
import { useKeepAwakeWhilePlaying } from '@navigation/hooks';
import { useBabyStore } from '@data-access/stores/use-baby-store';
import { useBabySessionTimer } from '../hooks/use-baby-session-timer';
import { TimeLimitScreen } from './TimeLimitScreen';
import { BabyResponsePrompt } from './BabyResponsePrompt';
import type { BabyResponse } from './BabyResponsePrompt';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const VISUALIZER_COLORS = colors.babyVisualizerColors;
const NUM_SHAPES = 5;
const BEAT_INTERVAL_MS = Math.round(60000 / 70); // 70 BPM default

interface ShapeConfig {
  id: number;
  x: number;
  y: number;
  size: number;
  type: 'circle' | 'square';
  colorIndex: number;
}

/**
 * Generates semi-random non-overlapping shape positions.
 */
const generateShapes = (): ShapeConfig[] => {
  const shapes: ShapeConfig[] = [];
  const padding = 60;
  const maxAttempts = 50;

  for (let i = 0; i < NUM_SHAPES; i++) {
    const size = 60 + Math.random() * 60; // 60-120px
    let x = 0;
    let y = 0;
    let attempts = 0;
    let valid = false;

    while (!valid && attempts < maxAttempts) {
      x = padding + Math.random() * (SCREEN_WIDTH - size - padding * 2);
      y = padding + 80 + Math.random() * (SCREEN_HEIGHT - size - padding * 2 - 160);
      valid = shapes.every((s) => {
        const dist = Math.sqrt((s.x - x) ** 2 + (s.y - y) ** 2);
        return dist > (s.size + size) / 2 + 20;
      });
      attempts++;
    }

    shapes.push({
      id: i,
      x,
      y,
      size,
      type: i % 2 === 0 ? 'circle' : 'square',
      colorIndex: i % VISUALIZER_COLORS.length,
    });
  }

  return shapes;
};

/**
 * Full-screen baby visualizer with geometric shapes that pulse on beat.
 * Uses warm colors and gentle animations designed for infant visual engagement.
 */
const BabyVisualizerScreen = () => {
  const router = useRouter();
  const babyProfile = useBabyStore((state) => state.babyProfile);
  const logBabySession = useBabyStore((state) => state.logBabySession);
  const babyName = babyProfile?.babyName || 'Baby';

  useKeepAwakeWhilePlaying({ always: true });

  const startTimeRef = useRef(Date.now());
  const [showPrompt, setShowPrompt] = useState(false);

  const shapes = useMemo(() => generateShapes(), []);
  const scaleAnimations = useRef(
    shapes.map(() => new Animated.Value(1)),
  ).current;
  const [colorIndices, setColorIndices] = useState(
    shapes.map((s) => s.colorIndex),
  );

  const {
    isTimeLimitReached,
    hasExtended,
    extend,
  } = useBabySessionTimer();

  // Beat-synced pulsing animation
  useEffect(() => {
    const interval = setInterval(() => {
      scaleAnimations.forEach((anim) => {
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1.3,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, BEAT_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [scaleAnimations]);

  // Color cycling: shift colors every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setColorIndices((prev) =>
        prev.map((ci) => (ci + 1) % VISUALIZER_COLORS.length),
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleEnd = useCallback(() => {
    setShowPrompt(true);
  }, []);

  const handleResponseSelect = useCallback(
    (response: BabyResponse) => {
      if (babyProfile) {
        logBabySession({
          babyProfileId: babyProfile.id,
          activityType: 'visualizer',
          duration: Math.round((Date.now() - startTimeRef.current) / 1000),
          babyResponse: response,
          completedAt: new Date().toISOString(),
        });
      }
      setShowPrompt(false);
      router.back();
    },
    [babyProfile, logBabySession, router],
  );

  const handleDismissPrompt = useCallback(() => {
    if (babyProfile) {
      logBabySession({
        babyProfileId: babyProfile.id,
        activityType: 'visualizer',
        duration: Math.round((Date.now() - startTimeRef.current) / 1000),
        babyResponse: null,
        completedAt: new Date().toISOString(),
      });
    }
    setShowPrompt(false);
    router.back();
  }, [babyProfile, logBabySession, router]);

  if (isTimeLimitReached && !showPrompt) {
    return (
      <TimeLimitScreen
        hasExtended={hasExtended}
        onExtend={extend}
        onEnd={handleEnd}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Close button */}
      <Pressable
        testID="visualizer-close"
        accessibilityLabel="Close Visualizer"
        accessibilityRole="button"
        onPress={handleEnd}
        style={styles.closeButton}
      >
        <Text variant="body" color={colors.babyTextSecondary}>
          X
        </Text>
      </Pressable>

      {/* Animated shapes */}
      {shapes.map((shape, idx) => {
        const colorIdx = colorIndices[idx] ?? 0;
        const shapeColor = VISUALIZER_COLORS[colorIdx] ?? VISUALIZER_COLORS[0];
        const scaleAnim = scaleAnimations[idx];

        return (
          <Animated.View
            key={shape.id}
            testID={`visualizer-shape-${shape.id}`}
            style={[
              {
                position: 'absolute',
                left: shape.x,
                top: shape.y,
                width: shape.size,
                height: shape.size,
                backgroundColor: shapeColor,
                borderRadius:
                  shape.type === 'circle' ? shape.size / 2 : shape.size * 0.15,
                transform: [{ scale: scaleAnim as unknown as number }],
              },
            ]}
          />
        );
      })}

      <BabyResponsePrompt
        visible={showPrompt}
        babyName={babyName}
        onSelect={handleResponseSelect}
        onDismiss={handleDismissPrompt}
      />
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
    top: 48,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});

export { BabyVisualizerScreen };
