import { View, StyleSheet } from 'react-native';
import { Text, Button } from '@design-system';
import { useRouter } from 'expo-router';

const BabyAgeScreen = () => {
  const router = useRouter();

  const handleContinue = () => {
    // TODO: Call userStore.completeOnboarding() when implemented
    router.replace('/(tabs)/learn');
  };

  const handleSkip = () => {
    router.replace('/(tabs)/learn');
  };

  return (
    <View style={styles.container}>
      <Text variant="h2">Baby&apos;s Age</Text>
      <Text variant="body">How old is your baby?</Text>
      {/* TODO: Age input UI in feature epic */}
      <Button
        onPress={handleContinue}
        accessibilityLabel="Continue with baby age"
      >
        Continue
      </Button>
      <Button
        onPress={handleSkip}
        accessibilityLabel="Skip baby age input"
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

export default BabyAgeScreen;
