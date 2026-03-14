import { View, StyleSheet } from 'react-native';
import { Text, Button } from '@design-system';
import { useRouter } from 'expo-router';
import { useUserStore } from '@data-access/stores/use-user-store';

const GenresScreen = () => {
  const router = useRouter();
  const profile = useUserStore((state) => state.profile);
  const role = profile?.role;

  const handleAdvance = () => {
    if (role === 'parent' || role === 'both') {
      router.push('/(onboarding)/baby-age');
    } else {
      // TODO: Call userStore.completeOnboarding() when implemented
      router.replace('/(tabs)/learn');
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="h2">Genre Preferences</Text>
      <Text variant="body">Select genres you enjoy (multi-select)</Text>
      {/* TODO: Genre multi-select UI in feature epic */}
      <Button
        onPress={handleAdvance}
        accessibilityLabel="Continue to next step"
      >
        Continue
      </Button>
      <Button
        onPress={handleAdvance}
        accessibilityLabel="Skip genre selection"
        variant="secondary"
      >
        Skip
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 32,
  },
});

export default GenresScreen;
