import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureProvider, SafeAreaProvider, ThemeProvider, LocalizationProvider } from '@entry-providers';
import { ErrorBoundary } from '@libs/error-handling/error-boundary';
import { useUserStore } from '@data-access/stores/use-user-store';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const RootLayoutNav = () => {
  const router = useRouter();
  const segments = useSegments();
  const isOnboarded = useUserStore((state) => state.isOnboarded);
  const firstSegment = segments[0];

  useEffect(() => {
    const inOnboarding = firstSegment === '(onboarding)';

    if (!isOnboarded && !inOnboarding) {
      router.replace('/(onboarding)');
    } else if (isOnboarded && inOnboarding) {
      router.replace('/(tabs)/learn');
    }
  }, [isOnboarded, firstSegment, router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
};

/**
 * Root layout -- outermost shell wrapping all routes with providers.
 *
 * Provider order (outermost to innermost):
 * 1. ThemeProvider
 * 2. GestureProvider
 * 3. SafeAreaProvider
 * 4. BottomSheetModalProvider
 * 5. LocalizationProvider
 * 6. ErrorBoundary
 */
const RootLayout = () => {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        // Load fonts and preload sounds in parallel
        // TODO: Add useFonts and preloadSounds when audio engine is built
        await Promise.all([
          // Font loading will go here
          // Audio preloading will go here
        ]);
      } catch (err) {
        console.warn('Error during app preparation:', err);
      } finally {
        setAppIsReady(true);
        SplashScreen.hideAsync();
      }
    };

    prepare();
  }, []);

  if (!appIsReady) {
    return null;
  }

  return (
    <ThemeProvider>
      <GestureProvider>
        <SafeAreaProvider>
          <BottomSheetModalProvider>
            <LocalizationProvider>
              <ErrorBoundary>
                <RootLayoutNav />
              </ErrorBoundary>
            </LocalizationProvider>
          </BottomSheetModalProvider>
        </SafeAreaProvider>
      </GestureProvider>
    </ThemeProvider>
  );
};

// Expo Router requires default export
export default RootLayout;
