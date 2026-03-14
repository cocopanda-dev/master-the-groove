// src/features/baby-mode/components/BabyVisualizerScreen.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Pressable, Animated, Dimensions } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Text } from '@design-system';
import { borderRadius, colors, spacing } from '@design-system/tokens';
import { useBabyStore } from '@data-access/stores';
import { playSound } from '@libs/audio';
import { VISUALIZER_BPM_MIN, VISUALIZER_BPM_MAX, capBabyVolume } from '../constants';
import { useBabySessionTimer } from '../hooks/use-baby-session-timer';
import { BabyResponsePrompt } from './BabyResponsePrompt';

interface BabyVisualizerScreenComponentProps {
  readonly babyProfileId: string;
  readonly babyName: string;
  readonly onClose: () => void;
}

interface Shape {
  readonly id: number;
  readonly type: 'circle' | 'star' | 'square' | 'triangle';
  readonly colorIndex: number;
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly scale: Animated.Value;
  readonly translateX: Animated.Value;
  readonly translateY: Animated.Value;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const SHAPE_TYPES = ['circle', 'star', 'square', 'triangle'] as const;

const createShapes = (): Shape[] =>
  Array.from({ length: 4 }, (_, i) => ({
    id: i,
    type: SHAPE_TYPES[i % SHAPE_TYPES.length] ?? 'circle',
    colorIndex: i % colors.babyVisualizerColors.length,
    x: (SCREEN_WIDTH * (i + 1)) / 5,
    y: (SCREEN_HEIGHT * ((i % 2) + 1)) / 3,
    size: 60 + (i * 15),
    scale: new Animated.Value(1),
    translateX: new Animated.Value(0),
    translateY: new Animated.Value(0),
  }));

export const BabyVisualizerScreenComponent = ({
  babyProfileId,
  babyName,
  onClose,
}: BabyVisualizerScreenComponentProps) => {
  const isFocused = useIsFocused();
  const [bpm, setBpm] = useState(70);
  const [colorOffset, setColorOffset] = useState(0);
  const [showResponse, setShowResponse] = useState(false);
  const shapesRef = useRef<Shape[]>(createShapes());
  const shapes = shapesRef.current;
  const startTime = useRef(Date.now());
  const beatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const timer = useBabySessionTimer();
  const logBabySession = useBabyStore((s) => s.logBabySession);

  const babyVolume = capBabyVolume(0.3);

  // Start timer on mount
  useEffect(() => {
    startTime.current = Date.now();
    timer.start();
    return () => {
      timer.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Beat-synced animation — only when screen is focused
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
      // Play soft beat sound
      playSound('woodblock', babyVolume, 0).catch(() => {});
      // Cycle colors on beat
      setColorOffset((prev) => (prev + 1) % colors.babyVisualizerColors.length);

      // Scale animation: 1.0 -> 1.3 -> 1.0
      for (const shape of shapes) {
        Animated.sequence([
          Animated.timing(shape.scale, {
            toValue: 1.3,
            duration: interval * 0.2,
            useNativeDriver: true,
          }),
          Animated.timing(shape.scale, {
            toValue: 1.0,
            duration: interval * 0.3,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, interval);

    return () => {
      if (beatIntervalRef.current) {
        clearInterval(beatIntervalRef.current);
        beatIntervalRef.current = null;
      }
    };
  }, [bpm, shapes, isFocused, babyVolume]);

  // Gentle float/drift between beats
  useEffect(() => {
    for (const shape of shapes) {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(shape.translateX, {
              toValue: 15,
              duration: 3000,
              useNativeDriver: true,
            }),
            Animated.timing(shape.translateX, {
              toValue: -15,
              duration: 3000,
              useNativeDriver: true,
            }),
            Animated.timing(shape.translateX, {
              toValue: 0,
              duration: 3000,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(shape.translateY, {
              toValue: 15,
              duration: 3500,
              useNativeDriver: true,
            }),
            Animated.timing(shape.translateY, {
              toValue: -15,
              duration: 3500,
              useNativeDriver: true,
            }),
            Animated.timing(shape.translateY, {
              toValue: 0,
              duration: 3500,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ).start();
    }

    return () => {
      for (const shape of shapes) {
        shape.translateX.stopAnimation();
        shape.translateY.stopAnimation();
      }
    };
  }, [shapes]);

  // Hidden BPM control via two-finger gesture (simplified: tap top-left corner)
  const handleBpmAdjust = useCallback((direction: 'up' | 'down') => {
    setBpm((b) => {
      const next = direction === 'up' ? b + 5 : b - 5;
      return Math.max(VISUALIZER_BPM_MIN, Math.min(VISUALIZER_BPM_MAX, next));
    });
  }, []);

  const handleDone = useCallback(() => {
    timer.stop();
    setShowResponse(true);
  }, [timer]);

  const handleResponse = useCallback(
    (response: 'calm' | 'excited' | 'disengaged' | null) => {
      const duration = Math.round((Date.now() - startTime.current) / 1000);
      logBabySession({
        babyProfileId,
        activityType: 'visualizer',
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

  const getShapeColor = (shape: Shape): string => {
    const idx = (shape.colorIndex + colorOffset) % colors.babyVisualizerColors.length;
    return colors.babyVisualizerColors[idx] ?? colors.babyPrimary;
  };

  const getShapeBorderRadius = (shape: Shape): number => {
    if (shape.type === 'square') return borderRadius.md;
    return shape.size / 2;
  };

  return (
    <View style={styles.container} testID="baby-visualizer-screen">
      {/* Close button */}
      <Pressable
        onPress={handleDone}
        style={styles.closeButton}
        accessibilityLabel="Close visualizer"
        accessibilityRole="button"
        testID="visualizer-close"
      >
        <Text variant="h4" color={colors.babyTextSecondary}>
          X
        </Text>
      </Pressable>

      {/* Hidden BPM controls (small tappable areas in corners) */}
      <Pressable
        onPress={() => handleBpmAdjust('down')}
        style={styles.hiddenBpmDown}
        accessibilityLabel="Decrease BPM"
        accessibilityRole="button"
        testID="visualizer-bpm-down"
      />
      <Pressable
        onPress={() => handleBpmAdjust('up')}
        style={styles.hiddenBpmUp}
        accessibilityLabel="Increase BPM"
        accessibilityRole="button"
        testID="visualizer-bpm-up"
      />

      {/* Shapes */}
      {shapes.map((shape) => (
        <Animated.View
          key={shape.id}
          testID={`visualizer-shape-${shape.id}`}
          style={[
            styles.shapeBase,
            {
              left: shape.x - shape.size / 2,
              top: shape.y - shape.size / 2,
              width: shape.size,
              height: shape.size,
              backgroundColor: getShapeColor(shape),
              borderRadius: getShapeBorderRadius(shape),
              transform: [
                { scale: shape.scale },
                { translateX: shape.translateX },
                { translateY: shape.translateY },
              ],
            },
            shape.type === 'triangle' && {
              width: 0,
              height: 0,
              backgroundColor: 'transparent',
              borderLeftWidth: shape.size / 2,
              borderRightWidth: shape.size / 2,
              borderBottomWidth: shape.size,
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderBottomColor: getShapeColor(shape),
              borderRadius: 0,
            },
          ]}
        />
      ))}

      {/* Timer warning */}
      {timer.status === 'warning' && (
        <View style={styles.warningBadge}>
          <Text variant="bodySmall" color={colors.warning}>
            {timer.remaining}s
          </Text>
        </View>
      )}
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
    top: spacing['2xl'],
    right: spacing.lg,
    zIndex: 10,
    padding: spacing.sm,
  },
  hiddenBpmDown: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: spacing.tapMinimumBaby,
    height: spacing.tapMinimumBaby,
    zIndex: 5,
  },
  hiddenBpmUp: {
    position: 'absolute',
    top: 0,
    right: spacing.tapMinimumBaby,
    width: spacing.tapMinimumBaby,
    height: spacing.tapMinimumBaby,
    zIndex: 5,
  },
  shapeBase: {
    position: 'absolute',
  },
  warningBadge: {
    position: 'absolute',
    bottom: spacing.xl,
    alignSelf: 'center',
    backgroundColor: colors.babySurface,
    borderRadius: 12,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
});
