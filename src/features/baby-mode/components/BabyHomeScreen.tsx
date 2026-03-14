// src/features/baby-mode/components/BabyHomeScreen.tsx
import React from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Text } from '@design-system';
import { colors } from '@design-system/tokens';
import { StageBanner } from './StageBanner';
import { ActivityCard } from './ActivityCard';
import type { BabyActivityCard } from './ActivityCard';
import { QuickLaunchButtons } from './QuickLaunchButtons';
import { useBabyStage } from '../hooks/use-baby-stage';

/**
 * Hardcoded sample activity cards for MVP (2-3 per stage).
 * No JSON data files needed per implementation rules.
 */
const SAMPLE_ACTIVITIES: BabyActivityCard[] = [
  {
    id: 'stage1-1',
    stageId: 1,
    title: 'Bounce & Count',
    instruction:
      'Hold baby upright. Bounce gently on beat 1. Say "DOWN" each time.',
    durationSeconds: 45,
    icon: '\u{1F476}',
  },
  {
    id: 'stage1-2',
    stageId: 1,
    title: 'Rock & Hum',
    instruction:
      'Rock baby side to side. Alternate left-right on each beat. Hum along.',
    durationSeconds: 60,
    icon: '\u{1F3B5}',
  },
  {
    id: 'stage2-1',
    stageId: 2,
    title: 'Pat-a-Cake',
    instruction:
      "Sit facing baby. Play pat-a-cake. Your hands meet baby's hands on beat 1.",
    durationSeconds: 45,
    icon: '\u{1F44F}',
  },
  {
    id: 'stage2-2',
    stageId: 2,
    title: 'Clap & Copy',
    instruction:
      'Clap a simple pattern: clap-clap-pause. Repeat. Celebrate any response.',
    durationSeconds: 60,
    icon: '\u{2B50}',
  },
  {
    id: 'stage3-1',
    stageId: 3,
    title: 'Tap Together',
    instruction:
      'Show baby the screen. Tap the big circle together. Celebrate each tap!',
    durationSeconds: 45,
    icon: '\u{1F44B}',
  },
  {
    id: 'stage3-2',
    stageId: 3,
    title: 'March & Stomp',
    instruction:
      'March in place together. Stomp on beat 1. Say "STOMP!"',
    durationSeconds: 60,
    icon: '\u{1F97E}',
  },
];

/**
 * Baby Mode home screen composing stage banner, activity cards, and quick launch buttons.
 */
const BabyHomeScreen = () => {
  const { stage, hasProfile, babyName } = useBabyStage();

  if (!hasProfile) {
    return (
      <View style={styles.container}>
        <View style={styles.setupPrompt}>
          <Text variant="h2" color={colors.babyTextPrimary} align="center">
            Set up Baby Mode
          </Text>
          <Text variant="body" color={colors.babyTextSecondary} align="center">
            Add a baby profile in Settings to get started with rhythmic bonding
            activities.
          </Text>
        </View>
      </View>
    );
  }

  if (stage === 0) {
    return (
      <View style={styles.container}>
        <StageBanner />
        <View style={styles.setupPrompt}>
          <Text variant="body" color={colors.babyTextSecondary} align="center">
            Baby mode starts at 3 months. In the meantime, play soft rhythms from
            the Practice tab while feeding or rocking {babyName}.
          </Text>
        </View>
      </View>
    );
  }

  const stageActivities = SAMPLE_ACTIVITIES.filter((a) => a.stageId === stage);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <StageBanner />

      <QuickLaunchButtons />

      <View style={styles.section}>
        <Text variant="h4" color={colors.babyTextPrimary}>
          Activities
        </Text>
        <FlatList
          data={stageActivities}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ActivityCard card={item} />}
          contentContainerStyle={styles.cardList}
        />
      </View>

      {stage >= 3 && (
        <View style={styles.comingSoon}>
          <Text
            variant="bodySmall"
            color={colors.babyTextSecondary}
            align="center"
          >
            More stages coming soon! Stage 3 activities are still great for{' '}
            {babyName}.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.babyBackground,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  setupPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
    gap: 12,
  },
  cardList: {
    paddingLeft: 8,
    paddingRight: 16,
  },
  comingSoon: {
    marginTop: 24,
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: colors.babySurface,
    borderRadius: 12,
  },
});

export { BabyHomeScreen };
