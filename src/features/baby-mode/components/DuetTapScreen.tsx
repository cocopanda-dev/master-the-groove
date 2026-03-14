// src/features/baby-mode/components/DuetTapScreen.tsx
import React, { useCallback, useRef, useState } from 'react';
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface RippleState {
  id: number;
  x: number;
  y: number;
  animation: Animated.Value;
}

/**
 * Duet Tap screen with two large tap zones (parent and baby).
 * Features ripple animations on tap, a simple BPM label,
 * and auto-session tracking.
 */
const DuetTapScreen = () => {
  const router = useRouter();
  const babyProfile = useBabyStore((state) => state.babyProfile);
  const logBabySession = useBabyStore((state) => state.logBabySession);
  const babyName = babyProfile?.babyName || 'Baby';

  useKeepAwakeWhilePlaying({ always: true });

  const startTimeRef = useRef(Date.now());
  const [showPrompt, setShowPrompt] = useState(false);
  const [ripples, setRipples] = useState<RippleState[]>([]);
  const rippleIdRef = useRef(0);
  const [bpm] = useState(80);

  const {
    elapsed,
    isWarning,
    isTimeLimitReached,
    hasExtended,
    extend,
  } = useBabySessionTimer();

  const handleEnd = useCallback(() => {
    setShowPrompt(true);
  }, []);

  const handleResponseSelect = useCallback(
    (response: BabyResponse) => {
      if (babyProfile) {
        logBabySession({
          babyProfileId: babyProfile.id,
          activityType: 'duet-tap',
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
        activityType: 'duet-tap',
        duration: Math.round((Date.now() - startTimeRef.current) / 1000),
        babyResponse: null,
        completedAt: new Date().toISOString(),
      });
    }
    setShowPrompt(false);
    router.back();
  }, [babyProfile, logBabySession, router]);

  const createRipple = useCallback(
    (x: number, y: number) => {
      const id = rippleIdRef.current++;
      const animation = new Animated.Value(0);

      setRipples((prev) => [...prev, { id, x, y, animation }]);

      Animated.timing(animation, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      });
    },
    [],
  );

  const handleTapZone = useCallback(
    (event: { nativeEvent: { locationX: number; locationY: number } }, offsetX: number) => {
      const { locationX, locationY } = event.nativeEvent;
      createRipple(locationX + offsetX, locationY);
    },
    [createRipple],
  );

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

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
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          testID="duet-tap-close"
          accessibilityLabel="Close Duet Tap"
          accessibilityRole="button"
          onPress={handleEnd}
          style={styles.closeButton}
        >
          <Text variant="h3" color={colors.babyTextPrimary}>
            X
          </Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text variant="body" color={colors.babyTextSecondary}>
            {bpm} BPM
          </Text>
          <Text
            variant="bodySmall"
            color={isWarning ? colors.error : colors.babyTextSecondary}
          >
            {formatTime(elapsed)}
          </Text>
        </View>
        <View style={styles.closeButton} />
      </View>

      {/* Tap Zones */}
      <View style={styles.zonesContainer}>
        <Pressable
          testID="tap-zone-parent"
          accessibilityLabel="Parent tap zone"
          accessibilityRole="button"
          onPress={(e) => handleTapZone(e, 0)}
          style={styles.zoneParent}
        >
          <Text variant="h2" color="#FFFFFF" align="center">
            You
          </Text>
        </Pressable>

        <Pressable
          testID="tap-zone-baby"
          accessibilityLabel={`${babyName} tap zone`}
          accessibilityRole="button"
          onPress={(e) => handleTapZone(e, SCREEN_WIDTH / 2)}
          style={styles.zoneBaby}
        >
          <Text variant="h2" color="#FFFFFF" align="center">
            {babyName}
          </Text>
        </Pressable>
      </View>

      {/* Ripple animations */}
      {ripples.map((ripple) => {
        const scale = ripple.animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.3, 2],
        });
        const opacity = ripple.animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.6, 0],
        });
        return (
          <Animated.View
            key={ripple.id}
            pointerEvents="none"
            style={[
              styles.ripple,
              {
                left: ripple.x - 40,
                top: ripple.y + 60,
                transform: [{ scale }],
                opacity,
              },
            ]}
          />
        );
      })}

      {/* Warning indicator */}
      {isWarning && (
        <View style={styles.warningBanner} testID="warning-banner">
          <Text variant="bodySmall" color={colors.error} align="center">
            Almost done!
          </Text>
        </View>
      )}

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    height: 56,
  },
  headerCenter: {
    alignItems: 'center',
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zonesContainer: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  zoneParent: {
    flex: 1,
    backgroundColor: colors.babyTapZoneA,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  zoneBaby: {
    flex: 1,
    backgroundColor: colors.babyTapZoneB,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  ripple: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.babyCelebration,
  },
  warningBanner: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});

export { DuetTapScreen };
