import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Text } from '@design-system';
import { colors, spacing } from '@design-system/tokens';
import { useSessionStore } from '@data-access/stores/use-session-store';
import { SessionHistoryList } from '@features/progress-tracking';

const HistoryScreen = () => {
  const params = useLocalSearchParams<{ polyrhythmId?: string }>();
  const [filterId, setFilterId] = React.useState<string | undefined>(params.polyrhythmId);

  const allSessions = useSessionStore((s) => s.sessionHistory);
  const getSessionsForPolyrhythm = useSessionStore((s) => s.getSessionsForPolyrhythm);

  const sessions = filterId ? getSessionsForPolyrhythm(filterId) : allSessions;

  return (
    <View style={styles.container} testID="history-screen">
      {filterId && (
        <View style={styles.filterBar}>
          <Text variant="bodySmall" color={colors.textSecondary}>
            Showing sessions for {filterId}
          </Text>
          <Pressable
            onPress={() => setFilterId(undefined)}
            accessibilityRole="button"
            accessibilityLabel="Show all sessions"
          >
            <Text variant="bodySmall" color={colors.primaryLight}>
              Show All
            </Text>
          </Pressable>
        </View>
      )}

      <SessionHistoryList
        sessions={sessions}
        emptyMessage={
          filterId
            ? `No sessions yet for ${filterId}. Start practicing to build your history!`
            : 'No sessions yet. Start practicing to build your history!'
        }
        testID="session-history-list"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});

export default HistoryScreen;
