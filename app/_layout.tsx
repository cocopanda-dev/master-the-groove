import React from 'react';
import { Stack } from 'expo-router';
import { GestureProvider, SafeAreaProvider, ThemeProvider, LocalizationProvider } from '@entry-providers';
import { ErrorBoundary } from '@libs/error-handling';
import { colors } from '@design-system';

export default function RootLayout() {
  return (
    <GestureProvider>
      <SafeAreaProvider>
        <LocalizationProvider>
          <ThemeProvider>
            <ErrorBoundary>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: colors.background },
                }}
              />
            </ErrorBoundary>
          </ThemeProvider>
        </LocalizationProvider>
      </SafeAreaProvider>
    </GestureProvider>
  );
}
