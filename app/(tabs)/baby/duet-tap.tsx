import { View, StyleSheet } from 'react-native';
import { Text } from '@design-system';
import { colors } from '@design-system/tokens';

const DuetTapScreen = () => (
  <View style={styles.container}>
    <Text variant="h2">Duet Tap</Text>
    <Text variant="body">Two-zone tap screen</Text>
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

export default DuetTapScreen;
