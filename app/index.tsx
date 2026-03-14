import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@design-system';
import { colors, spacing } from '@design-system';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text variant="h2" align="center">GrooveCore</Text>
      <Text variant="body" color={colors.textSecondary} align="center">
        Feel-first rhythm training
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
});
