import {
  useSharedValue,
  useDerivedValue,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { colors } from '@design-system/tokens';

interface BabyPaletteResult {
  backgroundColor: string;
  activeTint: string;
  inactiveTint: string;
}

const TRANSITION_DURATION = 200;

/**
 * Provides animated color values for the tab bar that transition
 * between the default palette and the baby palette.
 *
 * When the baby tab is active, the tab bar smoothly transitions
 * over 200ms to warm baby-mode colors.
 *
 * @param isBabyActive - Whether the baby tab is currently focused
 * @returns Object with animated backgroundColor, activeTint, and inactiveTint
 */
const useBabyPalette = (isBabyActive: boolean): BabyPaletteResult => {
  const progress = useSharedValue(isBabyActive ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isBabyActive ? 1 : 0, {
      duration: TRANSITION_DURATION,
    });
  }, [isBabyActive, progress]);

  const backgroundColor = useDerivedValue(() =>
    interpolateColor(
      progress.value,
      [0, 1],
      [colors.surface, colors.babySurface],
    ),
  );

  const activeTint = useDerivedValue(() =>
    interpolateColor(
      progress.value,
      [0, 1],
      [colors.primary, colors.babyPrimary],
    ),
  );

  const inactiveTint = useDerivedValue(() =>
    interpolateColor(
      progress.value,
      [0, 1],
      [colors.textSecondary, colors.babyTextSecondary],
    ),
  );

  return {
    backgroundColor: backgroundColor.value as string,
    activeTint: activeTint.value as string,
    inactiveTint: inactiveTint.value as string,
  };
};

export { useBabyPalette };
export type { BabyPaletteResult };
