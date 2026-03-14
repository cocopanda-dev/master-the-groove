import { View, StyleSheet } from 'react-native';
import { Text } from '@design-system';

const ProgressScreen = () => (
  <View style={styles.container}>
    <Text variant="h2">My Progress</Text>
    <Text variant="body">Feel status and session history</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProgressScreen;
