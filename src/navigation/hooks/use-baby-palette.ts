import { useMemo } from 'react';
import { colors } from '@design-system/tokens';

interface BabyPaletteResult {
  backgroundColor: string;
  activeTint: string;
  inactiveTint: string;
}

const DEFAULT_PALETTE: BabyPaletteResult = {
  backgroundColor: colors.surface,
  activeTint: colors.primary,
  inactiveTint: colors.textSecondary,
};

const BABY_PALETTE: BabyPaletteResult = {
  backgroundColor: colors.babySurface,
  activeTint: colors.babyPrimary,
  inactiveTint: colors.babyTextSecondary,
};

/**
 * Returns tab bar color palette based on whether the baby tab is active.
 *
 * @param isBabyActive - Whether the baby tab is currently focused
 * @returns Object with backgroundColor, activeTint, and inactiveTint
 */
const useBabyPalette = (isBabyActive: boolean): BabyPaletteResult =>
  useMemo(() => (isBabyActive ? BABY_PALETTE : DEFAULT_PALETTE), [isBabyActive]);

export { useBabyPalette };
export type { BabyPaletteResult };
