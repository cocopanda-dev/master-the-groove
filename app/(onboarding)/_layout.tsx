import { Stack } from 'expo-router';
import { HEADER_STYLES } from '@navigation/constants';

/**
 * Onboarding flow stack layout.
 *
 * Flow: Welcome -> Role -> Genres -> Baby Age (conditional)
 *
 * - No back gesture on first screen (Welcome)
 * - Skip option available on Genres and Baby Age
 * - On completion, user is redirected to (tabs)
 */
const OnboardingLayout = () => (
  <Stack
    screenOptions={{
      ...HEADER_STYLES,
      headerShown: false,
      gestureEnabled: true,
      animation: 'slide_from_right',
    }}
  >
    <Stack.Screen
      name="index"
      options={{
        gestureEnabled: false,
      }}
    />
    <Stack.Screen name="role" />
    <Stack.Screen name="genres" />
    <Stack.Screen name="baby-age" />
  </Stack>
);

export default OnboardingLayout;
