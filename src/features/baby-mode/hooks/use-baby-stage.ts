// src/features/baby-mode/hooks/use-baby-stage.ts
import { useMemo } from 'react';
import { useBabyStore } from '@data-access/stores/use-baby-store';
import { calculateStageFromBirthDate } from '@operations/baby/calculate-stage';
import { STAGE_NAMES, STAGE_AGE_RANGES } from '../constants';

interface BabyStageInfo {
  /** The effective stage number (override or auto-calculated) */
  stage: number;
  /** Human-readable stage name (e.g., "Pat-a-Cake Mode") */
  stageName: string;
  /** Age range description (e.g., "6-12 months") */
  ageRange: string;
  /** Baby's age in months */
  ageInMonths: number;
  /** Baby's name (fallback: "Your little one") */
  babyName: string;
  /** Whether a profile exists */
  hasProfile: boolean;
}

/**
 * Computes the current baby stage from the baby store profile.
 * Uses stageOverride if set, otherwise auto-calculates from birthDate.
 */
const useBabyStage = (): BabyStageInfo => {
  const babyProfile = useBabyStore((state) => state.babyProfile);

  return useMemo(() => {
    if (!babyProfile) {
      return {
        stage: 0,
        stageName: STAGE_NAMES[0] ?? 'Unknown',
        ageRange: STAGE_AGE_RANGES[0] ?? '',
        ageInMonths: 0,
        babyName: 'Your little one',
        hasProfile: false,
      };
    }

    const now = new Date();
    const birth = new Date(babyProfile.birthDate);
    const ageInMonths =
      (now.getUTCFullYear() - birth.getUTCFullYear()) * 12 +
      (now.getUTCMonth() - birth.getUTCMonth());

    const autoStage = calculateStageFromBirthDate(babyProfile.birthDate);
    const stage =
      babyProfile.stageOverride !== null
        ? babyProfile.stageOverride
        : autoStage;

    // MVP caps at stage 3
    const effectiveStage = Math.min(stage, 3);

    return {
      stage: effectiveStage,
      stageName: STAGE_NAMES[effectiveStage] ?? 'Unknown',
      ageRange: STAGE_AGE_RANGES[effectiveStage] ?? '',
      ageInMonths,
      babyName: babyProfile.babyName || 'Your little one',
      hasProfile: true,
    };
  }, [babyProfile]);
};

export { useBabyStage };
export type { BabyStageInfo };
