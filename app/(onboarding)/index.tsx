import { View, StyleSheet } from 'react-native';
import { Text, Button } from '@design-system';
import { useRouter } from 'expo-router';

const WelcomeScreen = () => {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/(onboarding)/role');
  };

  return (
    <View style={styles.container}>
      <Text variant="h1">GrooveCore</Text>
      <Text variant="body">What do you want to feel?</Text>
      <Button
        onPress={handleGetStarted}
        accessibilityLabel="Get started with onboarding"
      >
        Get Started
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    padding: 32,
  },
});

export default WelcomeScreen;
