// src/features/core-player/components/RadialVisualizer.tsx
import React, { useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { useAudioStore } from '@data-access/stores/use-audio-store';
import { colors } from '@design-system/tokens/colors';
import { beatPulse } from '@design-system/tokens/animations';
import type { PolyrhythmRatio } from '@types';

type RadialVisualizerProps = {
  ratio: PolyrhythmRatio;
  isPlaying: boolean;
};

const VISUALIZER_SIZE = 240;
const ORBIT_RADIUS = 90;
const DOT_SIZE_NORMAL = 12;
const DOT_SIZE_BEAT1 = 18;

/**
 * Compute (x, y) for a dot at given index out of total,
 * starting at 12 o'clock (angle = -PI/2).
 */
const getDotPosition = (index: number, total: number, orbitRadius: number) => {
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
  const cx = VISUALIZER_SIZE / 2;
  const cy = VISUALIZER_SIZE / 2;
  return {
    x: cx + orbitRadius * Math.cos(angle),
    y: cy + orbitRadius * Math.sin(angle),
  };
};

type DotProps = {
  x: number;
  y: number;
  size: number;
  color: string;
  isBeat1: boolean;
  beatScale: SharedValue<number>;
};

const BeatDot = ({ x, y, size, color, isBeat1, beatScale }: DotProps) => {
  const dotSize = isBeat1 ? DOT_SIZE_BEAT1 : size;

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: beatScale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.dot,
        animStyle,
        {
          width: dotSize,
          height: dotSize,
          borderRadius: dotSize / 2,
          backgroundColor: color,
          left: x - dotSize / 2,
          top: y - dotSize / 2,
        },
        isBeat1 ? styles.beat1Dot : null,
      ]}
    />
  );
};

export const RadialVisualizer = ({ ratio, isPlaying }: RadialVisualizerProps) => {
  const audio = useAudioStore();

  // One animated scale value per dot per layer
  const layerAScales = useRef<SharedValue<number>[]>([]);
  const layerBScales = useRef<SharedValue<number>[]>([]);

  // Create MAX_BEATS = 8 shared values for each layer unconditionally (hooks rule)
  const aScale0 = useSharedValue(1);
  const aScale1 = useSharedValue(1);
  const aScale2 = useSharedValue(1);
  const aScale3 = useSharedValue(1);
  const aScale4 = useSharedValue(1);
  const aScale5 = useSharedValue(1);
  const aScale6 = useSharedValue(1);
  const aScale7 = useSharedValue(1);

  const bScale0 = useSharedValue(1);
  const bScale1 = useSharedValue(1);
  const bScale2 = useSharedValue(1);
  const bScale3 = useSharedValue(1);
  const bScale4 = useSharedValue(1);
  const bScale5 = useSharedValue(1);
  const bScale6 = useSharedValue(1);
  const bScale7 = useSharedValue(1);

  const allAScales: SharedValue<number>[] = [aScale0, aScale1, aScale2, aScale3, aScale4, aScale5, aScale6, aScale7];
  const allBScales: SharedValue<number>[] = [bScale0, bScale1, bScale2, bScale3, bScale4, bScale5, bScale6, bScale7];

  // Keep refs in sync so callback can use them without stale closure
  useEffect(() => {
    layerAScales.current = allAScales;
    layerBScales.current = allBScales;
  });

  const pulseDot = useCallback((scales: SharedValue<number>[], beatIndex: number) => {
    const sv = scales[beatIndex % scales.length];
    if (!sv) return;
    sv.value = withTiming(beatPulse.scaleActive, {
      duration: beatPulse.attackMs,
      easing: Easing.out(Easing.quad),
    });
    setTimeout(() => {
      sv.value = withTiming(beatPulse.scaleRest, {
        duration: beatPulse.decayMs,
        easing: Easing.in(Easing.quad),
      });
    }, beatPulse.attackMs);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const unsub = audio.onBeat((layer, beatIndex) => {
      if (layer === 'A') {
        pulseDot(layerAScales.current, beatIndex);
      } else {
        pulseDot(layerBScales.current, beatIndex);
      }
    });
    return unsub;
  }, [isPlaying, audio, pulseDot]);

  const ratioA = ratio.ratioA;
  const ratioB = ratio.ratioB;

  return (
    <View
      style={styles.container}
      accessibilityLabel={`Visualizer showing ${ratio.name} polyrhythm`}
      accessibilityRole="image"
    >
      {/* Center dot */}
      <View style={styles.centerDot} />

      {/* Layer A dots */}
      {Array.from({ length: ratioA }).map((_, i) => {
        const isBeat1 = i === 0;
        const pos = getDotPosition(i, ratioA, ORBIT_RADIUS - 10);
        // allAScales always has 8 values; i is always < ratioA <= 8
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const sv = allAScales[i] ?? allAScales[0]!;
        return (
          <BeatDot
            key={`a-${i}`}
            x={pos.x}
            y={pos.y}
            size={DOT_SIZE_NORMAL}
            color={isBeat1 ? colors.beatOne : colors.layerA}
            isBeat1={isBeat1}
            beatScale={sv}
          />
        );
      })}

      {/* Layer B dots */}
      {Array.from({ length: ratioB }).map((_, i) => {
        const isBeat1 = i === 0;
        const pos = getDotPosition(i, ratioB, ORBIT_RADIUS + 10);
        // allBScales always has 8 values; i is always < ratioB <= 8
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const sv = allBScales[i] ?? allBScales[0]!;
        return (
          <BeatDot
            key={`b-${i}`}
            x={pos.x}
            y={pos.y}
            size={DOT_SIZE_NORMAL}
            color={isBeat1 ? colors.beatOne : colors.layerB}
            isBeat1={isBeat1}
            beatScale={sv}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: VISUALIZER_SIZE,
    height: VISUALIZER_SIZE,
    position: 'relative',
    alignSelf: 'center',
  },
  dot: {
    position: 'absolute',
  },
  beat1Dot: {
    // beat 1 is slightly larger — handled via size prop
  },
  centerDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textMuted,
    left: VISUALIZER_SIZE / 2 - 4,
    top: VISUALIZER_SIZE / 2 - 4,
  },
});
