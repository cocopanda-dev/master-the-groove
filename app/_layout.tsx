import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider } from '@entry-providers/theme-provider';
import { LocalizationProvider } from '@entry-providers/localization-provider';
import { useUserStore } from '@data-access/stores/use-user-store';
import { StyleSheet } from 'react-native';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const RootLayoutNav = () => {
  const router = useRouter();
  const segments = useSegments();
  const isOnboarded = useUserStore((state) => state.isOnboarded);

  useEffect(() => {
    const inOnboarding = segments[0] === '(onboarding)';

    if (!isOnboarded && !inOnboarding) {
      router.replace('/(onboarding)');
    } else if (isOnboarded && inOnboarding) {
      router.replace('/(tabs)/learn');
    }
  }, [isOnboarded, segments, router]);

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
 * 2. GestureHandlerRootView
 * 3. SafeAreaProvider
 * 4. BottomSheetModalProvider
 * 5. LocalizationProvider
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
      }
    };

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <ThemeProvider>
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaProvider>
          <BottomSheetModalProvider>
            <LocalizationProvider>
              <RootLayoutNav />
            </LocalizationProvider>
          </BottomSheetModalProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

// Expo Router requires default export
export default RootLayout;
