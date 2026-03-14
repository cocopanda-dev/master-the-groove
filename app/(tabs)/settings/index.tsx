import React, { useCallback, useState } from 'react';
import { ScrollView, View, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/shallow';
import { Text, Slider, Button } from '@design-system';
import { colors } from '@design-system/tokens/colors';
import { spacing } from '@design-system/tokens/spacing';
import { borderRadius } from '@design-system/tokens/border-radius';
import { useSettingsStore } from '@data-access/stores/use-settings-store';
import { MVP_SOUND_OPTIONS } from '@features/core-player/constants';
import type { SoundId } from '@types';

// ─── Types ────────────────────────────────────────────────────────────────────

type ToggleRowProps = {
  label: string;
  value: boolean;
  onToggle: () => void;
  settingName: string;
};

type SoundPickerProps = {
  layer: 'A' | 'B';
  selected: SoundId;
  onSelect: (id: SoundId) => void;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const ToggleRow = ({ label, value, onToggle, settingName }: ToggleRowProps) => (
  <Pressable
    style={styles.toggleRow}
    onPress={onToggle}
    accessibilityRole="switch"
    accessibilityLabel={label}
    accessibilityState={{ checked: value }}
    testID={`toggle-${settingName}`}
  >
    <Text variant="body" color={colors.textPrimary}>
      {label}
    </Text>
    <View style={[styles.toggleIndicator, value ? styles.toggleOn : styles.toggleOff]}>
      <Text variant="caption" color={value ? colors.textPrimary : colors.textMuted}>
        {value ? 'ON' : 'OFF'}
      </Text>
    </View>
  </Pressable>
);

const SoundPicker = ({ layer, selected, onSelect }: SoundPickerProps) => (
  <View style={styles.soundPickerRow}>
    <Text variant="bodySmall" color={colors.textSecondary}>
      Sound {layer}
    </Text>
    <View style={styles.pillRow}>
      {MVP_SOUND_OPTIONS.map((opt) => {
        const isSelected = opt.id === selected;
        return (
          <Pressable
            key={opt.id}
            style={[styles.pill, isSelected && styles.pillSelected]}
            onPress={() => onSelect(opt.id as SoundId)}
            accessibilityRole="radio"
            accessibilityLabel={`Sound ${layer} ${opt.label}`}
            accessibilityState={{ selected: isSelected }}
            testID={`sound-${layer.toLowerCase()}-${opt.id}`}
          >
            <Text
              variant="caption"
              color={isSelected ? colors.textPrimary : colors.textSecondary}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  </View>
);

// ─── Screen ───────────────────────────────────────────────────────────────────

const SettingsScreen = () => {
  const [confirmingReset, setConfirmingReset] = useState(false);

  const settings = useSettingsStore(
    useShallow((s) => ({
      masterVolume: s.masterVolume,
      defaultBpm: s.defaultBpm,
      preferredSoundA: s.preferredSoundA,
      preferredSoundB: s.preferredSoundB,
      hapticEnabled: s.hapticEnabled,
      keepScreenAwake: s.keepScreenAwake,
      showBeatNumbers: s.showBeatNumbers,
      visualizerStyle: s.visualizerStyle,
      babyModeVolumeLimit: s.babyModeVolumeLimit,
      updateSetting: s.updateSetting,
      resetToDefaults: s.resetToDefaults,
    })),
  );

  const handleReset = useCallback(() => {
    if (confirmingReset) {
      settings.resetToDefaults();
      setConfirmingReset(false);
    } else {
      setConfirmingReset(true);
      // Auto-cancel confirmation after 3 seconds
      setTimeout(() => setConfirmingReset(false), 3000);
    }
  }, [confirmingReset, settings]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        testID="settings-screen"
      >
        {/* ── Audio ── */}
        <Text variant="h4" color={colors.textSecondary}>
          Audio
        </Text>

        <View style={styles.sectionCard}>
          <View style={styles.sliderRow}>
            <Text variant="bodySmall" color={colors.textSecondary}>
              Master Volume
            </Text>
            <Slider
              value={settings.masterVolume}
              onValueChange={(v) => settings.updateSetting('masterVolume', v)}
              minimumValue={0}
              maximumValue={1}
              accessibilityLabel="Master volume"
              testID="volume-slider"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.sliderRow}>
            <View style={styles.sliderLabelRow}>
              <Text variant="bodySmall" color={colors.textSecondary}>
                Default BPM
              </Text>
              <Text variant="bodySmall" color={colors.textPrimary}>
                {Math.round(settings.defaultBpm)}
              </Text>
            </View>
            <Slider
              value={settings.defaultBpm}
              onValueChange={(v) => settings.updateSetting('defaultBpm', v)}
              minimumValue={40}
              maximumValue={200}
              step={1}
              accessibilityLabel="Default BPM"
              testID="bpm-slider"
            />
          </View>

          <View style={styles.divider} />

          <SoundPicker
            layer="A"
            selected={settings.preferredSoundA}
            onSelect={(id) => settings.updateSetting('preferredSoundA', id)}
          />

          <View style={styles.divider} />

          <SoundPicker
            layer="B"
            selected={settings.preferredSoundB}
            onSelect={(id) => settings.updateSetting('preferredSoundB', id)}
          />
        </View>

        {/* ── Display ── */}
        <Text variant="h4" color={colors.textSecondary}>
          Display
        </Text>

        <View style={styles.sectionCard}>
          <ToggleRow
            label="Show Beat Numbers"
            value={settings.showBeatNumbers}
            onToggle={() => settings.updateSetting('showBeatNumbers', !settings.showBeatNumbers)}
            settingName="showBeatNumbers"
          />

          <View style={styles.divider} />

          <View style={styles.toggleRow}>
            <Text variant="body" color={colors.textPrimary}>
              Visualizer Style
            </Text>
            <View style={styles.pillRow}>
              {(['circular', 'linear'] as const).map((style) => {
                const isSelected = settings.visualizerStyle === style;
                return (
                  <Pressable
                    key={style}
                    style={[styles.pill, isSelected && styles.pillSelected]}
                    onPress={() => settings.updateSetting('visualizerStyle', style)}
                    accessibilityRole="radio"
                    accessibilityLabel={`Visualizer style ${style}`}
                    accessibilityState={{ selected: isSelected }}
                    testID={`toggle-visualizerStyle`}
                  >
                    <Text
                      variant="caption"
                      color={isSelected ? colors.textPrimary : colors.textSecondary}
                    >
                      {style.charAt(0).toUpperCase() + style.slice(1)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {/* ── Feedback ── */}
        <Text variant="h4" color={colors.textSecondary}>
          Feedback
        </Text>

        <View style={styles.sectionCard}>
          <ToggleRow
            label="Haptic Feedback"
            value={settings.hapticEnabled}
            onToggle={() => settings.updateSetting('hapticEnabled', !settings.hapticEnabled)}
            settingName="hapticEnabled"
          />

          <View style={styles.divider} />

          <ToggleRow
            label="Keep Screen Awake"
            value={settings.keepScreenAwake}
            onToggle={() => settings.updateSetting('keepScreenAwake', !settings.keepScreenAwake)}
            settingName="keepScreenAwake"
          />
        </View>

        {/* ── Baby Mode ── */}
        <Text variant="h4" color={colors.textSecondary}>
          Baby Mode
        </Text>

        <View style={styles.sectionCard}>
          <View style={styles.sliderRow}>
            <View style={styles.sliderLabelRow}>
              <Text variant="bodySmall" color={colors.textSecondary}>
                Volume Limit
              </Text>
              <Text variant="bodySmall" color={colors.textPrimary}>
                {Math.round(settings.babyModeVolumeLimit * 100)}%
              </Text>
            </View>
            <Slider
              value={settings.babyModeVolumeLimit}
              onValueChange={(v) => settings.updateSetting('babyModeVolumeLimit', v)}
              minimumValue={0}
              maximumValue={1}
              accessibilityLabel="Baby mode volume limit"
              testID="baby-volume-slider"
            />
          </View>
        </View>

        {/* ── Reset ── */}
        <Text variant="h4" color={colors.textSecondary}>
          Reset
        </Text>

        <View style={styles.sectionCard}>
          <View testID="reset-defaults-btn">
            <Button
              variant="ghost"
              accessibilityLabel={confirmingReset ? 'Confirm reset to defaults' : 'Reset to defaults'}
              onPress={handleReset}
            >
              {confirmingReset ? 'Tap again to confirm' : 'Reset to Defaults'}
            </Button>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  sliderRow: {
    gap: spacing.xs,
  },
  sliderLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: spacing.tapMinimum,
  },
  toggleIndicator: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.full,
    minWidth: 44,
    alignItems: 'center',
  },
  toggleOn: {
    backgroundColor: colors.primaryLight,
  },
  toggleOff: {
    backgroundColor: colors.surfaceLight,
  },
  soundPickerRow: {
    gap: spacing.xs,
  },
  pillRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceLight,
  },
  pillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryLight,
  },
  bottomSpacer: {
    height: spacing['2xl'],
  },
});

export default SettingsScreen;
