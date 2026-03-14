import { View, StyleSheet } from 'react-native';
import { Text } from '@design-system';
import { colors } from '@design-system/tokens';

const BabyVisualizerScreen = () => (
  <View style={styles.container}>
    <Text variant="h2">Baby Visualizer</Text>
    <Text variant="body">Full-screen animated visual</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.babyBackground,
  },
});

export default BabyVisualizerScreen;
