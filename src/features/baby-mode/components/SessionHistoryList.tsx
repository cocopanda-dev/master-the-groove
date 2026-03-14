// src/features/baby-mode/components/SessionHistoryList.tsx
import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '@design-system';
import { colors, spacing } from '@design-system/tokens';
import { useShallow } from 'zustand/shallow';
import { useBabyStore } from '@data-access/stores';
import type { BabySession } from '@types';

interface DayGroup {
  readonly date: string;
  readonly sessions: readonly BabySession[];
}

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
};

const responseLabel = (response: BabySession['babyResponse']): string => {
  if (response === 'calm') return 'Calm';
  if (response === 'excited') return 'Excited';
  if (response === 'disengaged') return 'Disengaged';
  return '-';
};

export const SessionHistoryList = () => {
  const { babySessions, babyProfile } = useBabyStore(
    useShallow((s) => ({ babySessions: s.babySessions, babyProfile: s.babyProfile })),
  );

  const groups = useMemo((): readonly DayGroup[] => {
    if (!babyProfile) return [];

    const profileSessions = babySessions
      .filter((s) => s.babyProfileId === babyProfile.id)
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

    const map = new Map<string, BabySession[]>();
    for (const session of profileSessions) {
      const dayKey = session.completedAt.slice(0, 10);
      const existing = map.get(dayKey);
      if (existing) {
        existing.push(session);
      } else {
        map.set(dayKey, [session]);
      }
    }

    return Array.from(map.entries()).map(([date, sessions]) => ({
      date,
      sessions,
    }));
  }, [babySessions, babyProfile]);

  const weeklyCount = useMemo(() => {
    if (!babyProfile) return 0;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return babySessions.filter(
      (s) => s.babyProfileId === babyProfile.id && new Date(s.completedAt) >= weekAgo,
    ).length;
  }, [babySessions, babyProfile]);

  if (groups.length === 0) {
    return (
      <View style={styles.container} testID="session-history-empty">
        <Text variant="body" color={colors.babyTextSecondary} align="center">
          No sessions yet. Start an activity to begin tracking!
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} testID="session-history-list">
      <View style={styles.summaryCard}>
        <Text variant="h4" color={colors.babyTextPrimary}>
          This Week
        </Text>
        <Text variant="body" color={colors.babyPrimary}>
          {weeklyCount} {weeklyCount === 1 ? 'session' : 'sessions'}
        </Text>
      </View>

      {groups.map((group) => (
        <View key={group.date} style={styles.dayGroup}>
          <Text variant="h4" color={colors.babyTextPrimary}>
            {formatDate(group.sessions[0]?.completedAt ?? group.date)}
          </Text>
          {group.sessions.map((session) => (
            <View key={session.id} style={styles.sessionRow}>
              <Text variant="body" color={colors.babyTextPrimary}>
                {session.activityType}
              </Text>
              <Text variant="bodySmall" color={colors.babyTextSecondary}>
                {formatDuration(session.duration)} - {responseLabel(session.babyResponse)}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.babyBackground,
    padding: spacing.md,
  },
  summaryCard: {
    backgroundColor: colors.babySurface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  dayGroup: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  sessionRow: {
    backgroundColor: colors.babySurface,
    borderRadius: 8,
    padding: spacing.md,
    gap: spacing.xxs,
  },
});
