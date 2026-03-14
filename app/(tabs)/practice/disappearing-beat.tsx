import { View, StyleSheet } from 'react-native';
import { Text } from '@design-system';

const DisappearingBeatScreen = () => (
  <View style={styles.container}>
    <Text variant="h2">Disappearing Beat</Text>
    <Text variant="body">Staged mute challenge</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default DisappearingBeatScreen;
