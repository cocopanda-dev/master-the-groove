import { View, StyleSheet, TextInput } from 'react-native';
import { Text, Button } from '@design-system';
import { colors } from '@design-system/tokens/colors';
import { borderRadius } from '@design-system/tokens/border-radius';
import { useRouter } from 'expo-router';
import {
  useOnboardingContext,
  ProgressDots,
  GenreChip,
  GENRES,
  OTHER_GENRE_MAX_LENGTH,
} from '@features/onboarding';

const GenresScreen = () => {
  const router = useRouter();
  const {
    data,
    toggleGenre,
    setCustomGenre,
    needsBabyScreen,
    completeFlow,
    totalSteps,
    stepIndex,
  } = useOnboardingContext();

  const showOtherInput = data.genrePreferences.includes('Other');

  const handleAdvance = () => {
    if (needsBabyScreen) {
      router.push('/(onboarding)/baby-age');
    } else {
      completeFlow();
    }
  };

  const handleSkip = () => {
    if (needsBabyScreen) {
      router.push('/(onboarding)/baby-age');
    } else {
      completeFlow();
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <ProgressDots total={totalSteps} currentIndex={stepIndex('genres')} />
      <View style={styles.headerRow}>
        <Text variant="h2" color={colors.textPrimary}>
          What music do you love?
        </Text>
        <Button
          onPress={handleSkip}
          variant="ghost"
          size="sm"
          accessibilityLabel="Skip genre selection"
        >
          Skip
        </Button>
      </View>
      <Text variant="body" color={colors.textSecondary}>
        We&apos;ll use this to personalize your experience
      </Text>
      <View style={styles.chipGrid}>
        {GENRES.map((genre) => (
          <GenreChip
            key={genre}
            genre={genre}
            selected={data.genrePreferences.includes(genre)}
            onToggle={toggleGenre}
          />
        ))}
      </View>
      {showOtherInput && (
        <TextInput
          style={styles.otherInput}
          placeholder="Enter your genre..."
          placeholderTextColor={colors.textMuted}
          value={data.customGenre}
          onChangeText={setCustomGenre}
          maxLength={OTHER_GENRE_MAX_LENGTH}
          accessibilityLabel="Custom genre input"
          testID="other-genre-input"
        />
      )}
      <View style={styles.footer}>
        <Button
          onPress={handleAdvance}
          accessibilityLabel={needsBabyScreen ? 'Continue to baby info' : "Complete onboarding"}
        >
          Continue
        </Button>
        <Button
          onPress={handleBack}
          variant="ghost"
          accessibilityLabel="Go back to role selection"
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  otherInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: 12,
    color: colors.textPrimary,
    fontSize: 16,
  },
  footer: {
    marginTop: 'auto',
    gap: 8,
    paddingBottom: 32,
  },
});

export default GenresScreen;
