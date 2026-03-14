import { Stack } from 'expo-router';
import { HEADER_STYLES } from '@navigation/constants';
import { OnboardingProvider } from '@features/onboarding';

/**
 * Onboarding flow stack layout.
 *
 * Flow: Rhythms -> Experience -> Role -> Genres -> Baby Age (conditional)
 *
 * - No back gesture on first screen (Rhythms)
 * - Skip option available on Genres and Baby Age (name only)
 * - On completion, user is redirected to (tabs)
 */
const OnboardingLayout = () => (
  <OnboardingProvider>
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
      <Stack.Screen name="experience" />
      <Stack.Screen name="role" />
      <Stack.Screen name="genres" />
      <Stack.Screen name="baby-age" />
    </Stack>
  </OnboardingProvider>
);

export default OnboardingLayout;
