import { View, StyleSheet } from 'react-native';
import { Text } from '@design-system';

const PracticeScreen = () => (
  <View style={styles.container}>
    <Text variant="h2">Practice</Text>
    <Text variant="body">Core player with all controls</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PracticeScreen;
