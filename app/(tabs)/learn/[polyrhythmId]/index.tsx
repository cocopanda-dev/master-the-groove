import { View, StyleSheet } from 'react-native';
import { Text } from '@design-system';
import { useLocalSearchParams } from 'expo-router';

const PolyrhythmDetailScreen = () => {
  const { polyrhythmId } = useLocalSearchParams<{ polyrhythmId: string }>();

  return (
    <View style={styles.container}>
      <Text variant="h2">Polyrhythm Detail</Text>
      <Text variant="body">{polyrhythmId}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PolyrhythmDetailScreen;
