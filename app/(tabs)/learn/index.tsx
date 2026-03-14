import { View, StyleSheet } from 'react-native';
import { Text } from '@design-system';

const LearnScreen = () => (
  <View style={styles.container}>
    <Text variant="h2">Learn</Text>
    <Text variant="body">Polyrhythm library grid</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LearnScreen;
