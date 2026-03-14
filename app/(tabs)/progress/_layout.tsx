import { Stack } from 'expo-router';
import { HEADER_STYLES } from '@navigation/constants';

/**
 * Progress tab stack:
 * - index: Progress dashboard
 * - history: Full session history (accepts optional polyrhythmId filter)
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
    <Stack.Screen
      name="history"
      options={{ title: 'Session History' }}
    />
  </Stack>
);

export default ProgressLayout;
