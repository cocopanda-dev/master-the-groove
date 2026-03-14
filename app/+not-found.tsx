import { View, StyleSheet } from 'react-native';
import { Text, Button } from '@design-system';
import { colors, spacing } from '@design-system/tokens';
import { Link, Stack } from 'expo-router';

const NotFoundScreen = () => (
  <>
    <Stack.Screen options={{ title: 'Not Found' }} />
    <View style={styles.container}>
      <Text variant="h2" color={colors.textPrimary}>Page Not Found</Text>
      <Text variant="body" color={colors.textSecondary}>This screen does not exist.</Text>
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
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
});

export default NotFoundScreen;
