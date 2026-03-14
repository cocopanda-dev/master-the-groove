// src/design-system/components/slider/Slider.tsx
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, PanResponder, StyleSheet } from 'react-native';
import { colors } from '../../tokens/colors';
import type { SliderProps } from './types';

const THUMB_SIZE = 20;
const TRACK_HEIGHT = 4;

/**
 * Custom slider component implemented with PanResponder.
 * Avoids external native module dependency (@react-native-community/slider).
 */
export const Slider = ({
  value,
  onValueChange,
  onSlidingComplete,
  minimumValue = 0,
  maximumValue = 1,
  step = 0,
  minimumTrackTintColor = colors.primaryLight,
  maximumTrackTintColor = colors.border,
  thumbTintColor = colors.textPrimary,
  disabled = false,
  accessibilityLabel,
  testID,
}: SliderProps) => {
  const trackWidth = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  // Store latest callbacks in refs so PanResponder always sees current values
  const latestRef = useRef({ onValueChange, onSlidingComplete, disabled, minimumValue, maximumValue, step });
  latestRef.current = { onValueChange, onSlidingComplete, disabled, minimumValue, maximumValue, step };

  const valueFromX = useCallback((x: number): number => {
    const { minimumValue: min, maximumValue: max, step: s } = latestRef.current;
    const ratio = Math.max(0, Math.min(1, x / (trackWidth.current || 1)));
    const raw = min + ratio * (max - min);
    if (s <= 0) return raw;
    const steps = Math.round((raw - min) / s);
    return Math.max(min, Math.min(max, min + steps * s));
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !latestRef.current.disabled,
        onMoveShouldSetPanResponder: () => !latestRef.current.disabled,
        onPanResponderGrant: (evt) => {
          setIsDragging(true);
          const x = evt.nativeEvent.locationX;
          latestRef.current.onValueChange(valueFromX(x));
        },
        onPanResponderMove: (evt) => {
          const x = evt.nativeEvent.locationX;
          latestRef.current.onValueChange(valueFromX(x));
        },
        onPanResponderRelease: (evt) => {
          setIsDragging(false);
          const x = evt.nativeEvent.locationX;
          const finalValue = valueFromX(x);
          latestRef.current.onValueChange(finalValue);
          latestRef.current.onSlidingComplete?.(finalValue);
        },
        onPanResponderTerminate: () => {
          setIsDragging(false);
        },
      }),
    [valueFromX],
  );

  const ratio =
    maximumValue === minimumValue
      ? 0
      : (value - minimumValue) / (maximumValue - minimumValue);

  return (
    <View
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="adjustable"
      accessibilityValue={{
        min: minimumValue,
        max: maximumValue,
        now: value,
      }}
      style={styles.container}
      onLayout={(e) => {
        trackWidth.current = e.nativeEvent.layout.width;
      }}
      {...panResponder.panHandlers}
    >
      {/* Track background */}
      <View style={[styles.track, { backgroundColor: maximumTrackTintColor }]}>
        {/* Filled portion */}
        <View
          style={[
            styles.filled,
            {
              width: `${ratio * 100}%`,
              backgroundColor: minimumTrackTintColor,
            },
          ]}
        />
      </View>
      {/* Thumb */}
      <View
        style={[
          styles.thumb,
          {
            left: `${ratio * 100}%`,
            backgroundColor: thumbTintColor,
            opacity: disabled ? 0.4 : 1,
            transform: [{ scale: isDragging ? 1.2 : 1 }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: THUMB_SIZE + 8,
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    overflow: 'hidden',
  },
  filled: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    marginLeft: -(THUMB_SIZE / 2),
    top: '50%',
    marginTop: -(THUMB_SIZE / 2),
  },
});
