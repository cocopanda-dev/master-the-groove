import { View, StyleSheet } from 'react-native';
import { Text } from '@design-system';
import { colors } from '@design-system/tokens';

const BabyHomeScreen = () => (
  <View style={styles.container}>
    <Text variant="h2">Baby Mode</Text>
    <Text variant="body">Stage overview and activity cards</Text>
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

export default BabyHomeScreen;
