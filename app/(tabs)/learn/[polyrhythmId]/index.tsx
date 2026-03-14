import { useEffect } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { Text, Card, Badge, Button } from '@design-system';
import { colors, spacing, borderRadius } from '@design-system/tokens';
import { MVP_RATIOS } from '@types';
import { ACTIVE_RATIO_IDS } from '@features/core-player/constants';
import { useLessonStore, useSessionStore } from '@data-access/stores';
import type { FeelState } from '@types';

const TOTAL_STEPS = 7;

const feelStateLabel: Record<FeelState, string> = {
  executing: 'Executing',
  hearing: 'Hearing',
  feeling: 'Feeling',
};

const feelStateBadgeVariant: Record<FeelState, 'executing' | 'hearing' | 'feeling'> = {
  executing: 'executing',
  hearing: 'hearing',
  feeling: 'feeling',
};

const PolyrhythmDetailScreen = () => {
  const { polyrhythmId } = useLocalSearchParams<{ polyrhythmId: string }>();
  const router = useRouter();
  const navigation = useNavigation();

  const ratio = MVP_RATIOS.find((r) => r.id === polyrhythmId);

  const progressByPolyrhythm = useLessonStore((s) => s.progressByPolyrhythm);
  const getSessionsForPolyrhythm = useSessionStore((s) => s.getSessionsForPolyrhythm);
  const getCurrentFeelState = useSessionStore((s) => s.getCurrentFeelState);

  const progress = polyrhythmId ? progressByPolyrhythm[polyrhythmId] : undefined;
  const sessions = polyrhythmId ? getSessionsForPolyrhythm(polyrhythmId) : [];
  const feelState = polyrhythmId ? getCurrentFeelState(polyrhythmId) : null;

  const isActive = polyrhythmId ? ACTIVE_RATIO_IDS.has(polyrhythmId) : false;

  const totalSeconds = sessions.reduce((sum, s) => sum + s.duration, 0);
  const totalMinutes = Math.round(totalSeconds / 60);

  useEffect(() => {
    if (ratio) {
      navigation.setOptions({ title: ratio.name });
    }
  }, [navigation, ratio]);

  const handleLessonPress = () => {
    if (!polyrhythmId) return;
    router.push({ pathname: '/learn/[polyrhythmId]/lesson', params: { polyrhythmId } });
  };

  const getLessonButtonLabel = (): string => {
    if (!progress) return 'Start Lesson';
    if (progress.completed) return 'Review Lesson';
    return `Continue Lesson (Step ${progress.currentStep}/${TOTAL_STEPS})`;
  };

  const getProgressDisplay = (): string => {
    if (!progress) return `Step 0 of ${TOTAL_STEPS}`;
    if (progress.completed) return 'Completed!';
    return `Step ${progress.currentStep} of ${TOTAL_STEPS}`;
  };

  const getProgressFraction = (): number => {
    if (!progress) return 0;
    if (progress.completed) return 1;
    return (progress.currentStep - 1) / TOTAL_STEPS;
  };

  if (!ratio) {
    return (
      <View style={styles.notFound}>
        <Text variant="h2" color={colors.textPrimary} align="center">
          Polyrhythm Not Found
        </Text>
        <Text variant="body" color={colors.textSecondary} align="center">
          "{polyrhythmId}" does not exist.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      testID="polyrhythm-detail"
    >
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroRatioContainer}>
          <Text variant="h1" color={colors.primaryLight} align="center">
            {ratio.name}
          </Text>
        </View>
        <Text variant="h3" color={colors.textPrimary} align="center">
          {ratio.displayName}
        </Text>
        {!isActive && (
          <Badge label="Coming Soon" variant="comingSoon" />
        )}
      </View>

      {/* Feel state */}
      {feelState && (
        <View style={styles.feelRow}>
          <Text variant="caption" color={colors.textSecondary}>
            Current feel state
          </Text>
          <Badge
            label={feelStateLabel[feelState]}
            variant={feelStateBadgeVariant[feelState]}
            testID="feel-state-badge"
          />
        </View>
      )}

      {/* Cultural origin */}
      <Card variant="outlined" style={styles.card}>
        <Text variant="caption" color={colors.textMuted}>
          CULTURAL ORIGIN
        </Text>
        <Text variant="body" color={colors.textPrimary}>
          {ratio.culturalOrigin}
        </Text>
      </Card>

      {/* Mnemonic */}
      <Card variant="outlined" style={styles.card}>
        <Text variant="caption" color={colors.textMuted}>
          MNEMONIC
        </Text>
        <Text variant="h3" color={colors.accent} align="center">
          &ldquo;{ratio.mnemonic}&rdquo;
        </Text>
      </Card>

      {/* Lesson progress */}
      <Card variant="default" style={styles.card}>
        <Text variant="caption" color={colors.textMuted}>
          LESSON PROGRESS
        </Text>
        <Text variant="body" color={colors.textPrimary}>
          {getProgressDisplay()}
        </Text>
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${getProgressFraction() * 100}%` },
            ]}
          />
        </View>
      </Card>

      {/* Practice stats */}
      <View style={styles.statsRow}>
        <Card variant="default" style={[styles.card, styles.statCard]}>
          <Text
            variant="h3"
            color={colors.textPrimary}
            align="center"
            testID="session-count"
          >
            {sessions.length}
          </Text>
          <Text variant="caption" color={colors.textSecondary} align="center">
            practice sessions
          </Text>
        </Card>

        <Card variant="default" style={[styles.card, styles.statCard]}>
          <Text
            variant="h3"
            color={colors.textPrimary}
            align="center"
            testID="practice-time"
          >
            {totalMinutes}
          </Text>
          <Text variant="caption" color={colors.textSecondary} align="center">
            minutes practiced
          </Text>
        </Card>
      </View>

      {/* CTA */}
      {isActive && (
        <View testID="start-lesson-btn">
          <Button
            accessibilityLabel={getLessonButtonLabel()}
            onPress={handleLessonPress}
            variant="primary"
            size="lg"
          >
            {getLessonButtonLabel()}
          </Button>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing['2xl'],
    gap: spacing.md,
  },
  notFound: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  heroRatioContainer: {
    paddingVertical: spacing.sm,
  },
  feelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  card: {
    gap: spacing.sm,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.full,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
});

export default PolyrhythmDetailScreen;
