import { View, StyleSheet, TextInput, ScrollView, Pressable } from 'react-native';
import { Text, Button } from '@design-system';
import { colors } from '@design-system/tokens/colors';
import { borderRadius } from '@design-system/tokens/border-radius';
import { useState, useMemo } from 'react';
import { calculateStageFromBirthDate } from '@operations/baby/calculate-stage';
import { useOnboardingContext, ProgressDots } from '@features/onboarding';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

const STAGE_LABELS: Record<number, string> = {
  0: 'Stage 0: Passive Listening (0-3 months)',
  1: 'Stage 1: Parent Bounce (3-6 months)',
  2: 'Stage 2: Pat-a-Cake Mode (6-12 months)',
  3: 'Stage 3: Tap Mode (12-18 months)',
  4: 'Stage 4: Instrument Mode (18-36 months)',
  5: 'Stage 5: Simple Game Mode (3-5 years)',
};

const BabyAgeScreen = () => {
  const {
    data,
    setBabyName,
    setBabyBirthDate,
    canAdvanceFromBabyAge,
    completeFlow,
    totalSteps,
    stepIndex,
  } = useOnboardingContext();

  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = useMemo(() => {
    const result: number[] = [];
    for (let y = currentYear; y >= currentYear - 5; y--) {
      result.push(y);
    }
    return result;
  }, [currentYear]);

  const handleMonthSelect = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
    setShowMonthPicker(false);
    if (selectedYear !== null) {
      const dateStr = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}-15`;
      setBabyBirthDate(dateStr);
    }
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setShowYearPicker(false);
    if (selectedMonth !== null) {
      const dateStr = `${year}-${String(selectedMonth + 1).padStart(2, '0')}-15`;
      setBabyBirthDate(dateStr);
    }
  };

  const stageDisplay = useMemo(() => {
    if (!data.babyBirthDate) return null;
    const stage = calculateStageFromBirthDate(data.babyBirthDate);
    return STAGE_LABELS[stage] ?? `Stage ${stage}`;
  }, [data.babyBirthDate]);

  const handleComplete = () => {
    completeFlow();
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <ProgressDots total={totalSteps} currentIndex={stepIndex('baby-age')} />
      <Text variant="h2" align="center" color={colors.textPrimary}>
        Tell us about your little one
      </Text>
      <Text variant="body" align="center" color={colors.textSecondary}>
        You can change this anytime in Settings
      </Text>

      {/* Baby name input */}
      <View style={styles.field}>
        <Text variant="h4" color={colors.textPrimary}>
          Baby&apos;s name (optional)
        </Text>
        <TextInput
          style={styles.textInput}
          placeholder="Baby"
          placeholderTextColor={colors.textMuted}
          value={data.babyName}
          onChangeText={setBabyName}
          maxLength={50}
          accessibilityLabel="Baby name input"
          testID="baby-name-input"
        />
      </View>

      {/* Birth date picker */}
      <View style={styles.field}>
        <Text variant="h4" color={colors.textPrimary}>
          Birth date (required)
        </Text>
        <View style={styles.dateRow}>
          {/* Month selector */}
          <View style={styles.dateField}>
            <Pressable
              onPress={() => { setShowMonthPicker(!showMonthPicker); setShowYearPicker(false); }}
              style={styles.dateButton}
              accessibilityLabel="Select birth month"
              testID="month-selector"
            >
              <Text
                variant="body"
                color={selectedMonth !== null ? colors.textPrimary : colors.textMuted}
              >
                {selectedMonth !== null ? MONTHS[selectedMonth] : 'Month'}
              </Text>
            </Pressable>
            {showMonthPicker && (
              <View style={styles.dropdown} testID="month-dropdown">
                <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                  {MONTHS.map((month, i) => (
                    <Pressable
                      key={month}
                      onPress={() => handleMonthSelect(i)}
                      style={styles.dropdownItem}
                      testID={`month-option-${i}`}
                    >
                      <Text variant="body" color={colors.textPrimary}>
                        {month}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Year selector */}
          <View style={styles.dateField}>
            <Pressable
              onPress={() => { setShowYearPicker(!showYearPicker); setShowMonthPicker(false); }}
              style={styles.dateButton}
              accessibilityLabel="Select birth year"
              testID="year-selector"
            >
              <Text
                variant="body"
                color={selectedYear !== null ? colors.textPrimary : colors.textMuted}
              >
                {selectedYear !== null ? String(selectedYear) : 'Year'}
              </Text>
            </Pressable>
            {showYearPicker && (
              <View style={styles.dropdown} testID="year-dropdown">
                <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                  {years.map((year) => (
                    <Pressable
                      key={year}
                      onPress={() => handleYearSelect(year)}
                      style={styles.dropdownItem}
                      testID={`year-option-${year}`}
                    >
                      <Text variant="body" color={colors.textPrimary}>
                        {String(year)}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Stage display */}
      {stageDisplay && (
        <View style={styles.stageBox} testID="stage-display">
          <Text variant="body" color={colors.success}>
            {stageDisplay}
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <Button
          onPress={handleComplete}
          disabled={!canAdvanceFromBabyAge}
          accessibilityLabel="Complete onboarding"
        >
          Let&apos;s groove!
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 24,
    paddingTop: 60,
    gap: 16,
    flexGrow: 1,
  },
  field: {
    gap: 8,
    marginTop: 8,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: 12,
    color: colors.textPrimary,
    fontSize: 16,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateField: {
    flex: 1,
    zIndex: 1,
  },
  dateButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  dropdown: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    zIndex: 10,
    elevation: 10,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stageBox: {
    backgroundColor: colors.surfaceLight,
    padding: 16,
    borderRadius: borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.success,
  },
  footer: {
    marginTop: 'auto',
    gap: 8,
    paddingBottom: 32,
  },
});

export default BabyAgeScreen;
