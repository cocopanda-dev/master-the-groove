import React from 'react';
import { View, SectionList, StyleSheet } from 'react-native';
import { Text } from '@design-system';
import { colors, spacing } from '@design-system/tokens';
import type { Session } from '@types';
import { SessionEntryRow } from './SessionEntryRow';
import { EmptyState } from './EmptyState';
import { groupBy, getDayHeader } from '../utils';

type SessionHistoryListProps = {
  readonly sessions: Session[];
  readonly emptyMessage?: string;
  readonly testID?: string;
};

type SectionData = {
  title: string;
  data: Session[];
};

/**
 * Chronological list of sessions grouped by day.
 * Shows section headers like "Today", "Yesterday", "Mar 11".
 */
const SessionHistoryList = ({
  sessions,
  emptyMessage = 'No sessions yet. Start practicing to build your history!',
  testID,
}: SessionHistoryListProps) => {
  if (sessions.length === 0) {
    return <EmptyState message={emptyMessage} testID={testID ? `${testID}-empty` : undefined} />;
  }

  // Sessions are already sorted newest-first from the store.
  // Group by local calendar date.
  const grouped = groupBy(sessions, (s) => getDayHeader(s.startedAt));
  const sections: SectionData[] = [];
  for (const [title, data] of grouped) {
    sections.push({ title, data });
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <SessionEntryRow session={item} testID={testID ? `${testID}-row-${item.id}` : undefined} />
      )}
      renderSectionHeader={({ section: { title } }) => (
        <View style={styles.sectionHeader}>
          <Text variant="caption" color={colors.textMuted}>
            {title}
          </Text>
        </View>
      )}
      stickySectionHeadersEnabled={false}
      testID={testID}
    />
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
  },
});

export { SessionHistoryList };
export type { SessionHistoryListProps };
