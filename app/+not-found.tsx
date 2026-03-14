import { View, StyleSheet } from 'react-native';
import { Text, Button } from '@design-system';
import { Link, Stack } from 'expo-router';

const NotFoundScreen = () => (
  <>
    <Stack.Screen options={{ title: 'Not Found' }} />
    <View style={styles.container}>
      <Text variant="h2">Page Not Found</Text>
      <Text variant="body">This screen does not exist.</Text>
      <Link href="/(tabs)/learn" asChild>
        <Button
          onPress={() => undefined}
          accessibilityLabel="Navigate back to the Learn tab"
        >
          Go to Learn
        </Button>
      </Link>
    </View>
  </>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 32,
  },
});

export default NotFoundScreen;
