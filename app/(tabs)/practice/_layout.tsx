import { Stack } from 'expo-router';
import { HEADER_STYLES } from '@navigation/constants';

/**
 * Practice tab stack:
 * - index: Practice home (header hidden -- screen has its own header area)
 * - disappearing-beat: Disappearing Beat mode (header with back button)
 */
const PracticeLayout = () => (
  <Stack
    screenOptions={{
      ...HEADER_STYLES,
      headerShown: true,
    }}
  >
    <Stack.Screen
      name="index"
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="disappearing-beat"
      options={{ title: 'Disappearing Beat' }}
    />
  </Stack>
);

export default PracticeLayout;
