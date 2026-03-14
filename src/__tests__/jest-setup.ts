import '@testing-library/jest-native/extend-expect';
import './mocks/expo-av';
import './mocks/async-storage';
import './mocks/expo-secure-store';
import './mocks/netinfo';
import './mocks/supabase';

// Reanimated mock
jest.mock('react-native-reanimated', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
jest.mock('expo-keep-awake', () => require('./mocks/expo-keep-awake'));
// eslint-disable-next-line @typescript-eslint/no-require-imports
jest.mock('@gorhom/bottom-sheet', () => require('./mocks/gorhom-bottom-sheet'));
// eslint-disable-next-line @typescript-eslint/no-require-imports
jest.mock('@expo/vector-icons', () => require('./mocks/expo-vector-icons'));
