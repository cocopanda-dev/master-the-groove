import React from 'react';
import { ScrollView, StyleSheet, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@design-system';
import { colors, spacing } from '@design-system/tokens';
import {
  WeeklyOverviewCard,
  FeelStatusDashboard,
  EmptyState,
  useProgressData,
} from '@features/progress-tracking';

const ProgressScreen = () => {
  const router = useRouter();
  const { weeklySummary, polyrhythms, hasAnySessions } = useProgressData();

  if (!hasAnySessions) {
    return (
      <View style={styles.emptyContainer}>
        <EmptyState
          message="Start your first practice to see your progress here"
          testID="progress-empty"
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      testID="progress-screen"
    >
      <WeeklyOverviewCard
        totalMinutes={weeklySummary.totalMinutes}
        sessionCount={weeklySummary.sessionCount}
        polyrhythmsVisited={weeklySummary.polyrhythmsVisited}
        streak={weeklySummary.streak}
        feelStateChanges={weeklySummary.feelStateChanges}
        testID="weekly-overview"
      />

      <FeelStatusDashboard
        polyrhythms={polyrhythms}
        onPolyrhythmPress={(polyrhythmId) =>
          router.push({ pathname: '/(tabs)/progress/history', params: { polyrhythmId } })
        }
        testID="feel-dashboard"
      />

      <Pressable
        style={styles.viewAllButton}
        onPress={() => router.push('/(tabs)/progress/history')}
        accessibilityRole="link"
        accessibilityLabel="View all sessions"
      >
        <Text variant="body" color={colors.primaryLight}>
          View All Sessions
        </Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
  },
  viewAllButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
});

export default ProgressScreen;
