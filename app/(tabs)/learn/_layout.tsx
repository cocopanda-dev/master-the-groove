import { Stack } from 'expo-router';
import { HEADER_STYLES } from '@navigation/constants';

/**
 * Learn tab stack:
 * - index: Polyrhythm library grid (header shown)
 * - [polyrhythmId]/index: Polyrhythm detail (header with back button, title = polyrhythm name)
 * - [polyrhythmId]/lesson: Lesson flow (header hidden -- lesson has its own close/back UI)
 */
const LearnLayout = () => (
  <Stack
    screenOptions={{
      ...HEADER_STYLES,
      headerShown: true,
    }}
  >
    <Stack.Screen
      name="index"
      options={{ title: 'Learn' }}
    />
    <Stack.Screen
      name="[polyrhythmId]/index"
      options={{ title: '' }}
    />
    <Stack.Screen
      name="[polyrhythmId]/lesson"
      options={{ headerShown: false }}
    />
  </Stack>
);

export default LearnLayout;
