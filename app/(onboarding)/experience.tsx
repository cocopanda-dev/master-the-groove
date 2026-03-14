import { View, StyleSheet } from 'react-native';
import { Text, Button } from '@design-system';
import { colors } from '@design-system/tokens/colors';
import { useRouter } from 'expo-router';
import {
  useOnboardingContext,
  ProgressDots,
  ExperienceLevelCard,
  EXPERIENCE_LEVELS,
} from '@features/onboarding';

const ExperienceScreen = () => {
  const router = useRouter();
  const {
    data,
    setRhythmLevel,
    canAdvanceFromExperience,
    totalSteps,
    stepIndex,
  } = useOnboardingContext();

  const handleNext = () => {
    router.push('/(onboarding)/role');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <ProgressDots total={totalSteps} currentIndex={stepIndex('experience')} />
      <Text variant="h2" align="center" color={colors.textPrimary}>
        How&apos;s your rhythm experience?
      </Text>
      <View style={styles.cards}>
        {EXPERIENCE_LEVELS.map((option) => (
          <ExperienceLevelCard
            key={option.level}
            option={option}
            selected={data.rhythmLevel === option.level}
            onSelect={setRhythmLevel}
          />
        ))}
      </View>
      <View style={styles.footer}>
        <Button
          onPress={handleNext}
          disabled={!canAdvanceFromExperience}
          accessibilityLabel="Continue to role selection"
        >
          Next
        </Button>
        <Button
          onPress={handleBack}
          variant="ghost"
          accessibilityLabel="Go back to rhythm selection"
        >
          Back
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    paddingTop: 60,
    gap: 16,
  },
  cards: {
    gap: 12,
    marginTop: 16,
  },
  footer: {
    marginTop: 'auto',
    gap: 8,
    paddingBottom: 32,
  },
});

export default ExperienceScreen;
