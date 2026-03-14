import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { FeelState } from '@types';
import { colors } from '@design-system/tokens/colors';
import { spacing } from '@design-system/tokens/spacing';

type ThreeStateIndicatorProps = {
  readonly currentState: FeelState | null;
  readonly size?: number;
  readonly testID?: string;
};

const STATE_COLORS = {
  executing: colors.textMuted,
  hearing: colors.warning,
  feeling: colors.success,
} as const;

const STATES: FeelState[] = ['executing', 'hearing', 'feeling'];
const STATE_INDEX: Record<FeelState, number> = { executing: 0, hearing: 1, feeling: 2 };

/**
 * Three circles showing executing -> hearing -> feeling progression.
 *
 * - Filled circles for states at or before the current state
 * - Outlined circles for states after the current state
 * - All outlined when currentState is null
 */
const ThreeStateIndicator = ({ currentState, size = 12, testID }: ThreeStateIndicatorProps) => {
  const activeIndex = currentState ? STATE_INDEX[currentState] : -1;

  return (
    <View
      style={styles.container}
      testID={testID}
      accessibilityLabel={`Feel state: ${currentState ?? 'none'}`}
      accessibilityRole="image"
    >
      {STATES.map((state, index) => {
        const isFilled = index <= activeIndex;
        const circleColor = STATE_COLORS[state];

        return (
          <View
            key={state}
            testID={testID ? `${testID}-${state}` : undefined}
            style={[
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                borderWidth: 2,
                borderColor: circleColor,
                backgroundColor: isFilled ? circleColor : 'transparent',
                marginRight: index < STATES.length - 1 ? spacing.xs : 0,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export { ThreeStateIndicator };
export type { ThreeStateIndicatorProps };
