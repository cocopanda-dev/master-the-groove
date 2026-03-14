// src/features/baby-mode/hooks/use-baby-stage.ts
import { useMemo } from 'react';
import { useShallow } from 'zustand/shallow';
import { useBabyStore } from '@data-access/stores';
import { calculateStageFromBirthDate } from '@operations/baby/calculate-stage';
import { STAGE_NAMES, STAGE_AGE_RANGES } from '../constants';
import type { BabyStageInfo } from '../types';

export interface UseBabyStageResult {
  /** Effective stage number (override if set, otherwise auto-calculated) */
  readonly stage: number;

  /** Stage display info */
  readonly stageInfo: BabyStageInfo;

  /** Whether the stage is manually overridden */
  readonly isOverridden: boolean;

  /** Baby's name or fallback */
  readonly babyName: string;

  /** Baby's age in months (approximate) */
  readonly ageMonths: number;

  /** Whether a baby profile exists */
  readonly hasProfile: boolean;
}

export const useBabyStage = (): UseBabyStageResult => {
  const { babyProfile } = useBabyStore(
    useShallow((s) => ({ babyProfile: s.babyProfile })),
  );

  return useMemo(() => {
    if (!babyProfile) {
      return {
        stage: 1,
        stageInfo: { stage: 1, name: STAGE_NAMES[1] ?? 'Parent Bounce', ageRange: STAGE_AGE_RANGES[1] ?? '3-6 months' },
        isOverridden: false,
        babyName: 'Your little one',
        ageMonths: 0,
        hasProfile: false,
      };
    }

    const now = new Date();
    const autoStage = calculateStageFromBirthDate(babyProfile.birthDate, now);
    const effectiveStage = babyProfile.stageOverride ?? autoStage;

    // Clamp to MVP range (1-3)
    const clampedStage = Math.max(1, Math.min(3, effectiveStage));

    const birth = new Date(babyProfile.birthDate);
    const ageMonths =
      (now.getUTCFullYear() - birth.getUTCFullYear()) * 12 +
      (now.getUTCMonth() - birth.getUTCMonth());

    return {
      stage: clampedStage,
      stageInfo: {
        stage: clampedStage,
        name: STAGE_NAMES[clampedStage] ?? 'Unknown',
        ageRange: STAGE_AGE_RANGES[clampedStage] ?? '',
      },
      isOverridden: babyProfile.stageOverride !== null,
      babyName: babyProfile.babyName || 'Your little one',
      ageMonths: Math.max(0, ageMonths),
      hasProfile: true,
    };
  }, [babyProfile]);
};
