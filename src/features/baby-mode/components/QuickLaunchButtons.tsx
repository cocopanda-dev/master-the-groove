// src/features/baby-mode/components/QuickLaunchButtons.tsx
import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from '@design-system';
import { colors } from '@design-system/tokens';
import { useRouter } from 'expo-router';

/**
 * Two prominent buttons to quickly launch Duet Tap and Baby Visualizer.
 */
const QuickLaunchButtons = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Pressable
        testID="quick-launch-duet-tap"
        accessibilityLabel="Duet Tap"
        accessibilityHint="Launch the Duet Tap activity"
        accessibilityRole="button"
        onPress={() => router.push('/(tabs)/baby/duet-tap')}
        style={({ pressed }) => [
          styles.button,
          styles.duetTapButton,
          pressed && styles.pressed,
        ]}
      >
        <Text variant="h3" color="#FFFFFF" align="center">
          Duet Tap
        </Text>
        <Text variant="bodySmall" color="#FFFFFFCC" align="center">
          Tap together!
        </Text>
      </Pressable>

      <Pressable
        testID="quick-launch-visualizer"
        accessibilityLabel="Baby Visualizer"
        accessibilityHint="Launch the Baby Visualizer"
        accessibilityRole="button"
        onPress={() => router.push('/(tabs)/baby/visualizer')}
        style={({ pressed }) => [
          styles.button,
          styles.visualizerButton,
          pressed && styles.pressed,
        ]}
      >
        <Text variant="h3" color="#FFFFFF" align="center">
          Visualizer
        </Text>
        <Text variant="bodySmall" color="#FFFFFFCC" align="center">
          Watch shapes dance!
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 16,
    marginTop: 24,
  },
  button: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 100,
  },
  duetTapButton: {
    backgroundColor: colors.babyTapZoneA,
  },
  visualizerButton: {
    backgroundColor: colors.babySecondary,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
});

export { QuickLaunchButtons };
