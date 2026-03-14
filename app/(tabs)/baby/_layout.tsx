import { Stack } from 'expo-router';
import { colors } from '@design-system/tokens';

/**
 * Baby tab stack:
 * - index: Baby mode home (header with warm styling)
 * - duet-tap: Duet Tap screen (header with warm styling)
 * - visualizer: Full-screen baby visualizer (header hidden -- immersive)
 */
const BabyLayout = () => (
  <Stack
    screenOptions={{
      headerShown: true,
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: colors.babySurface,
      },
      headerTintColor: colors.babyPrimary,
      headerTitleStyle: {
        color: colors.babyTextPrimary,
        fontSize: 24,
        fontWeight: '600',
      },
    }}
  >
    <Stack.Screen
      name="index"
      options={{ title: 'Baby Mode' }}
    />
    <Stack.Screen
      name="duet-tap"
      options={{ title: 'Duet Tap' }}
    />
    <Stack.Screen
      name="visualizer"
      options={{ headerShown: false }}
    />
  </Stack>
);

export default BabyLayout;
