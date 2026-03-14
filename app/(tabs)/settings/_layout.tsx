import { Stack } from 'expo-router';
import { HEADER_STYLES } from '@navigation/constants';

/**
 * Settings tab stack:
 * - index: Settings screen (single screen for MVP)
 */
const SettingsLayout = () => (
  <Stack
    screenOptions={{
      ...HEADER_STYLES,
      headerShown: true,
    }}
  >
    <Stack.Screen
      name="index"
      options={{ title: 'Settings' }}
    />
  </Stack>
);

export default SettingsLayout;
