// src/features/baby-mode/components/BabyResponsePrompt.tsx
import React from 'react';
import { View, StyleSheet, Pressable, Modal } from 'react-native';
import { Text } from '@design-system';
import { colors } from '@design-system/tokens';

type BabyResponse = 'calm' | 'excited' | 'disengaged';

interface BabyResponsePromptProps {
  /** Whether the prompt is visible */
  readonly visible: boolean;
  /** Baby's name to display in the prompt */
  readonly babyName: string;
  /** Called with the selected response */
  readonly onSelect: (response: BabyResponse) => void;
  /** Called when the prompt is dismissed without selection */
  readonly onDismiss: () => void;
}

const RESPONSE_OPTIONS: ReadonlyArray<{
  value: BabyResponse;
  label: string;
  emoji: string;
  color: string;
}> = [
  { value: 'calm', label: 'Calm', emoji: '\u{1F60C}', color: '#A7F3D0' },
  { value: 'excited', label: 'Excited', emoji: '\u{1F929}', color: '#FDE68A' },
  { value: 'disengaged', label: 'Disengaged', emoji: '\u{1F634}', color: '#E5E7EB' },
];

/**
 * Post-activity prompt asking "How did [baby name] respond?"
 * Presents three large tappable cards: Calm, Excited, Disengaged.
 * Dismissible without selection (records null).
 */
const BabyResponsePrompt = ({
  visible,
  babyName,
  onSelect,
  onDismiss,
}: BabyResponsePromptProps) => (
  <Modal
    visible={visible}
    transparent
    animationType="slide"
    onRequestClose={onDismiss}
  >
    <Pressable
      style={styles.overlay}
      onPress={onDismiss}
      accessibilityLabel="Dismiss response prompt"
    >
      <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
        <Text variant="h3" color={colors.babyTextPrimary} align="center">
          How did {babyName} respond?
        </Text>
        <View style={styles.optionsRow}>
          {RESPONSE_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              testID={`response-${opt.value}`}
              accessibilityLabel={opt.label}
              accessibilityRole="button"
              onPress={() => onSelect(opt.value)}
              style={({ pressed }) => [
                styles.optionCard,
                { backgroundColor: opt.color },
                pressed && styles.optionPressed,
              ]}
            >
              <Text variant="h2" align="center">
                {opt.emoji}
              </Text>
              <Text variant="body" color={colors.babyTextPrimary} align="center">
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Pressable>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sheet: {
    backgroundColor: colors.babySurface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 48,
    gap: 20,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  optionCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 100,
  },
  optionPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
});

export { BabyResponsePrompt };
export type { BabyResponsePromptProps, BabyResponse };
