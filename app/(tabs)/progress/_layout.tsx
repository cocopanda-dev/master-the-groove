import { Stack } from 'expo-router';
import { HEADER_STYLES } from '@navigation/constants';

/**
 * Progress tab stack:
 * - index: Progress dashboard (single screen for MVP)
 */
const ProgressLayout = () => (
  <Stack
    screenOptions={{
      ...HEADER_STYLES,
      headerShown: true,
    }}
  >
    <Stack.Screen
      name="index"
      options={{ title: 'My Progress' }}
    />
  </Stack>
);

export default ProgressLayout;
