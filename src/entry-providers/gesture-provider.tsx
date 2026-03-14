import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

export const GestureProvider = ({ children }: { children: React.ReactNode }) => (
  <GestureHandlerRootView style={styles.root}>
    {children}
  </GestureHandlerRootView>
);

const styles = StyleSheet.create({
  root: { flex: 1 },
});
