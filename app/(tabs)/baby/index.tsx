import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@design-system';
import { colors, spacing } from '@design-system/tokens';
import { useShallow } from 'zustand/shallow';
import { useBabyStore } from '@data-access/stores';
import {
  useBabyStage,
  StageBanner,
  ActivityCardCarousel,
  ActivityDetailView,
  QuickLaunchButtons,
  SessionHistoryList,
  VolumeWarningModal,
  ParentalGate,
  stage1Cards,
  stage2Cards,
  stage3Cards,
} from '@features/baby-mode';
import type { BabyActivityCard } from '@features/baby-mode';

// JSON data conforms to BabyActivityCard shape (validated by stage JSON schema).
// resolveJsonModule infers a narrow literal type, so we widen to BabyActivityCard[].
const ALL_CARDS: Record<number, readonly BabyActivityCard[]> = {
  1: stage1Cards as BabyActivityCard[],
  2: stage2Cards as BabyActivityCard[],
  3: stage3Cards as BabyActivityCard[],
};

const BabyHomeScreen = () => {
  const router = useRouter();
  const { stage, stageInfo, babyName, ageMonths, hasProfile } = useBabyStage();
  const { babyProfile } = useBabyStore(
    useShallow((s) => ({ babyProfile: s.babyProfile })),
  );

  const [selectedCard, setSelectedCard] = useState<BabyActivityCard | null>(null);
  const [showSessions, setShowSessions] = useState(false);
  const [showVolumeWarning, setShowVolumeWarning] = useState(false);
  const [showParentalGate, setShowParentalGate] = useState(false);
  const [hasShownVolumeWarning, setHasShownVolumeWarning] = useState(false);

  // Show volume warning on first entry
  useEffect(() => {
    if (hasProfile && !hasShownVolumeWarning) {
      setShowVolumeWarning(true);
      setHasShownVolumeWarning(true);
    }
  }, [hasProfile, hasShownVolumeWarning]);

  const stageCards = useMemo(() => ALL_CARDS[stage] ?? [], [stage]);

  const featuredCard = useMemo(
    () => stageCards[Math.floor(Math.random() * stageCards.length)] ?? null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stage],
  );

  const handleCardPress = useCallback((card: BabyActivityCard) => {
    setSelectedCard(card);
  }, []);

  const handleDuetTap = useCallback(() => {
    router.push('/(tabs)/baby/duet-tap');
  }, [router]);

  const handleVisualizer = useCallback(() => {
    router.push('/(tabs)/baby/visualizer');
  }, [router]);

  const handleCloseDetail = useCallback(() => {
    setSelectedCard(null);
  }, []);

  const handleParentalGatePass = useCallback(() => {
    setShowParentalGate(false);
    router.back();
  }, [router]);

  // If no profile, show setup prompt
  if (!hasProfile || !babyProfile) {
    return (
      <View style={styles.setupContainer}>
        <Text variant="h2" color={colors.babyTextPrimary} align="center">
          Welcome to Baby Mode
        </Text>
        <Text variant="body" color={colors.babyTextSecondary} align="center">
          Set up a baby profile in Settings to get started with age-appropriate rhythm activities.
        </Text>
      </View>
    );
  }

  // Activity detail view
  if (selectedCard) {
    return (
      <ActivityDetailView
        card={selectedCard}
        babyProfileId={babyProfile.id}
        babyName={babyName}
        onClose={handleCloseDetail}
      />
    );
  }

  // Session history view
  if (showSessions) {
    return (
      <View style={styles.container}>
        <View style={styles.sessionsHeader}>
          <Pressable
            onPress={() => setShowSessions(false)}
            accessibilityLabel="Back"
            accessibilityRole="button"
          >
            <Text variant="body" color={colors.babyPrimary}>
              Back
            </Text>
          </Pressable>
          <Text variant="h3" color={colors.babyTextPrimary}>
            Sessions
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        <SessionHistoryList />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <StageBanner stageInfo={stageInfo} babyName={babyName} ageMonths={ageMonths} />

        {/* Today's Activity */}
        {featuredCard && (
          <View style={styles.featuredSection}>
            <Text variant="h4" color={colors.babyTextPrimary}>
              Today's Activity
            </Text>
            <Pressable
              onPress={() => handleCardPress(featuredCard)}
              style={styles.featuredCard}
              accessibilityLabel={`Featured: ${featuredCard.title}`}
              accessibilityRole="button"
              testID="featured-activity-card"
            >
              <Text variant="h3" color={colors.babyTextPrimary}>
                {featuredCard.title}
              </Text>
              <Text variant="body" color={colors.babyTextSecondary}>
                {featuredCard.instruction}
              </Text>
            </Pressable>
          </View>
        )}

        <ActivityCardCarousel
          cards={stageCards}
          title="Activities"
          onCardPress={handleCardPress}
        />

        <QuickLaunchButtons
          onDuetTap={handleDuetTap}
          onVisualizer={handleVisualizer}
        />

        <Pressable
          onPress={() => setShowSessions(true)}
          style={styles.sessionsLink}
          accessibilityLabel="View Sessions"
          accessibilityRole="button"
          testID="view-sessions-link"
        >
          <Text variant="body" color={colors.babyPrimary}>
            View Sessions
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setShowParentalGate(true)}
          style={styles.exitLink}
          accessibilityLabel="Exit Baby Mode"
          accessibilityRole="button"
          testID="exit-baby-mode"
        >
          <Text variant="bodySmall" color={colors.babyTextSecondary}>
            Exit Baby Mode
          </Text>
        </Pressable>
      </ScrollView>

      <VolumeWarningModal
        visible={showVolumeWarning}
        onDismiss={() => setShowVolumeWarning(false)}
      />

      {showParentalGate && (
        <ParentalGate
          onPass={handleParentalGatePass}
          onCancel={() => setShowParentalGate(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.babyBackground,
  },
  scrollContent: {
    paddingBottom: spacing['3xl'],
  },
  setupContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.babyBackground,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  featuredSection: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  featuredCard: {
    backgroundColor: colors.babySurface,
    borderRadius: 16,
    padding: spacing.xl,
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  sessionsLink: {
    alignItems: 'center',
    marginTop: spacing.xl,
    padding: spacing.md,
  },
  exitLink: {
    alignItems: 'center',
    marginTop: spacing.md,
    padding: spacing.md,
  },
  sessionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.babySurface,
  },
  headerSpacer: {
    width: 40,
  },
});

export default BabyHomeScreen;
