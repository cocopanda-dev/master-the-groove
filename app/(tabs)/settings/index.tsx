import { View, StyleSheet } from 'react-native';
import { Text } from '@design-system';

const SettingsScreen = () => (
  <View style={styles.container}>
    <Text variant="h2">Settings</Text>
    <Text variant="body">App preferences</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SettingsScreen;
