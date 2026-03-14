import React, { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, Card, Badge } from '@design-system';
import { colors, spacing } from '@design-system/tokens';
import { MVP_RATIOS } from '@types';
import { ACTIVE_RATIO_IDS } from '@features/core-player/constants';
import { useLessonStore, useSessionStore } from '@data-access/stores';
import type { PolyrhythmRatio } from '@types';
import type { FeelState } from '@types';

const FEEL_STATE_LABELS: Record<FeelState, string> = {
  executing: 'Executing',
  hearing: 'Hearing',
  feeling: 'Feeling',
};

type PolyrhythmCardProps = {
  ratio: PolyrhythmRatio;
  isActive: boolean;
  progress: { currentStep: number; completed: boolean } | null;
  feelState: FeelState | null;
  onPress: () => void;
};

const PolyrhythmCard = ({ ratio, isActive, progress, feelState, onPress }: PolyrhythmCardProps) => (
  <Pressable
    onPress={isActive ? onPress : undefined}
    disabled={!isActive}
    accessibilityRole={isActive ? 'button' : undefined}
    accessibilityLabel={isActive ? `Open ${ratio.displayName} lesson` : `${ratio.displayName} coming soon`}
    testID={`polyrhythm-card-${ratio.id}`}
  >
    <Card variant="elevated" style={[styles.card, !isActive && styles.cardDimmed]}>
      <View style={styles.cardHeader}>
        <Text variant="h2" color={isActive ? colors.textPrimary : colors.textMuted}>
          {ratio.name}
        </Text>

        <View style={styles.badges}>
          {!isActive && (
            <Badge label="Coming Soon" variant="comingSoon" />
          )}
          {isActive && feelState && (
            <Badge
              label={FEEL_STATE_LABELS[feelState]}
              variant={feelState}
              testID={`feel-badge-${ratio.id}`}
            />
          )}
        </View>
      </View>

      <Text
        variant="body"
        color={isActive ? colors.textPrimary : colors.textMuted}
      >
        {ratio.displayName}
      </Text>

      <Text
        variant="bodySmall"
        color={isActive ? colors.textSecondary : colors.textMuted}
      >
        {ratio.culturalOrigin}
      </Text>

      <Text
        variant="bodySmall"
        color={isActive ? colors.textSecondary : colors.textMuted}
      >
        &ldquo;{ratio.mnemonic}&rdquo;
      </Text>

      {isActive && (
        <View style={styles.progressRow} testID={`lesson-progress-${ratio.id}`}>
          {progress?.completed ? (
            <Badge label="Completed" variant="feeling" />
          ) : (
            <Badge
              label={progress ? `Step ${progress.currentStep}/7` : 'Step 1/7'}
              variant="neutral"
            />
          )}
        </View>
      )}
    </Card>
  </Pressable>
);

const LearnScreen = () => {
  const router = useRouter();
  const progressByPolyrhythm = useLessonStore((s) => s.progressByPolyrhythm);
  const getCurrentFeelState = useSessionStore((s) => s.getCurrentFeelState);

  const handleCardPress = useCallback(
    (ratioId: string) => {
      router.push({ pathname: '/learn/[polyrhythmId]', params: { polyrhythmId: ratioId } });
    },
    [router],
  );

  const renderItem = useCallback(
    ({ item: ratio }: { item: PolyrhythmRatio }) => {
      const isActive = ACTIVE_RATIO_IDS.has(ratio.id);
      const progress = progressByPolyrhythm[ratio.id] ?? null;
      const feelState = isActive ? getCurrentFeelState(ratio.id) : null;

      return (
        <PolyrhythmCard
          ratio={ratio}
          isActive={isActive}
          progress={progress}
          feelState={feelState}
          onPress={() => handleCardPress(ratio.id)}
        />
      );
    },
    [progressByPolyrhythm, getCurrentFeelState, handleCardPress],
  );

  return (
    <FlatList
      testID="learn-screen"
      data={MVP_RATIOS}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      style={styles.list}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text variant="h2" color={colors.textPrimary}>
            Polyrhythm Library
          </Text>
          <Text variant="bodySmall" color={colors.textSecondary}>
            Select a rhythm to begin your lesson
          </Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing['2xl'],
  },
  header: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  card: {
    gap: spacing.xs,
  },
  cardDimmed: {
    opacity: 0.5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  progressRow: {
    marginTop: spacing.sm,
  },
});

export default LearnScreen;
