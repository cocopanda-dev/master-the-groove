import { View, StyleSheet } from 'react-native';
import { Text, Button } from '@design-system';
import { colors } from '@design-system/tokens/colors';
import { useRouter } from 'expo-router';
import {
  useOnboardingContext,
  ProgressDots,
  RhythmCard,
  RHYTHM_OPTIONS,
} from '@features/onboarding';

const RhythmsScreen = () => {
  const router = useRouter();
  const { data, toggleRhythm, canAdvanceFromRhythms, totalSteps, stepIndex } =
    useOnboardingContext();

  const handleNext = () => {
    router.push('/(onboarding)/experience');
  };

  return (
    <View style={styles.container}>
      <ProgressDots total={totalSteps} currentIndex={stepIndex('rhythms')} />
      <Text variant="h2" align="center" color={colors.textPrimary}>
        What do you want to feel?
      </Text>
      <Text variant="body" align="center" color={colors.textSecondary}>
        Select the polyrhythms you want to explore
      </Text>
      <View style={styles.grid}>
        {RHYTHM_OPTIONS.map((option) => (
          <RhythmCard
            key={option.id}
            option={option}
            selected={data.selectedRhythms.includes(option.id)}
            onToggle={toggleRhythm}
          />
        ))}
      </View>
      <View style={styles.footer}>
        <Button
          onPress={handleNext}
          disabled={!canAdvanceFromRhythms}
          accessibilityLabel="Continue to experience selection"
        >
          Next
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginTop: 16,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: 32,
  },
});

export default RhythmsScreen;
