import type { ReactElement } from 'react';
import React from 'react';
import { render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>{children}</SafeAreaProvider>
  </GestureHandlerRootView>
);

export const renderWithProviders = (ui: ReactElement) => render(ui, { wrapper: AllProviders });

export { render } from '@testing-library/react-native';
