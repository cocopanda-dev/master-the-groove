// src/features/onboarding/hooks/use-onboarding-flow.ts
import { useCallback, useMemo, useState } from 'react';
import { generateId } from '@libs/uuid';
import { useUserStore } from '@data-access/stores/use-user-store';
import { useBabyStore } from '@data-access/stores/use-baby-store';
import { calculateStageFromBirthDate } from '@operations/baby/calculate-stage';
import type { OnboardingData, OnboardingStep, RhythmLevel, UserRole } from '../types';
import { INITIAL_ONBOARDING_DATA, MUSICIAN_STEPS, PARENT_STEPS } from '../constants';

export const useOnboardingFlow = () => {
  const [data, setData] = useState<OnboardingData>(INITIAL_ONBOARDING_DATA);

  const setProfile = useUserStore((s) => s.setProfile);
  const completeOnboarding = useUserStore((s) => s.completeOnboarding);
  const setBabyProfile = useBabyStore((s) => s.setBabyProfile);

  const steps: OnboardingStep[] = useMemo(() => {
    if (data.role === 'musician') return MUSICIAN_STEPS;
    return PARENT_STEPS;
  }, [data.role]);

  const needsBabyScreen = useMemo(
    () => data.role === 'parent' || data.role === 'both',
    [data.role],
  );

  const totalSteps = steps.length;

  const stepIndex = useCallback(
    (step: OnboardingStep): number => steps.indexOf(step),
    [steps],
  );

  // Data updaters
  const toggleRhythm = useCallback((rhythmId: string) => {
    setData((prev) => {
      const exists = prev.selectedRhythms.includes(rhythmId);
      return {
        ...prev,
        selectedRhythms: exists
          ? prev.selectedRhythms.filter((id) => id !== rhythmId)
          : [...prev.selectedRhythms, rhythmId],
      };
    });
  }, []);

  const setRhythmLevel = useCallback((level: RhythmLevel) => {
    setData((prev) => ({ ...prev, rhythmLevel: level }));
  }, []);

  const setRole = useCallback((role: UserRole) => {
    setData((prev) => ({ ...prev, role }));
  }, []);

  const toggleGenre = useCallback((genre: string) => {
    setData((prev) => {
      const exists = prev.genrePreferences.includes(genre);
      return {
        ...prev,
        genrePreferences: exists
          ? prev.genrePreferences.filter((g) => g !== genre)
          : [...prev.genrePreferences, genre],
      };
    });
  }, []);

  const setCustomGenre = useCallback((text: string) => {
    setData((prev) => ({ ...prev, customGenre: text }));
  }, []);

  const setBabyName = useCallback((name: string) => {
    setData((prev) => ({ ...prev, babyName: name }));
  }, []);

  const setBabyBirthDate = useCallback((date: string | null) => {
    setData((prev) => ({ ...prev, babyBirthDate: date }));
  }, []);

  // Validation
  const canAdvanceFromRhythms = data.selectedRhythms.length > 0;
  const canAdvanceFromExperience = data.rhythmLevel !== null;
  const canAdvanceFromRole = data.role !== null;
  const canAdvanceFromBabyAge = data.babyBirthDate !== null;

  // Completion
  const completeFlow = useCallback(() => {
    const now = new Date().toISOString();
    const userId = generateId();

    // Build genre list: include custom genre if "Other" is selected and text is non-empty
    const genres = [...data.genrePreferences];
    const otherIndex = genres.indexOf('Other');
    if (otherIndex !== -1) {
      const trimmed = data.customGenre.trim();
      if (trimmed.length > 0) {
        // Replace "Other" with the custom text
        genres[otherIndex] = trimmed;
      } else {
        // Remove "Other" if no custom text
        genres.splice(otherIndex, 1);
      }
    }

    setProfile({
      id: userId,
      displayName: null,
      email: null,
      role: data.role ?? 'musician',
      rhythmLevel: data.rhythmLevel ?? 'beginner',
      selectedRhythms: data.selectedRhythms,
      genrePreferences: genres,
      createdAt: now,
      updatedAt: now,
    });

    if (needsBabyScreen && data.babyBirthDate) {
      const stage = calculateStageFromBirthDate(data.babyBirthDate);
      setBabyProfile({
        id: generateId(),
        userId,
        babyName: data.babyName.trim() || 'Baby',
        birthDate: data.babyBirthDate,
        currentStage: stage,
        stageOverride: null,
      });
    }

    completeOnboarding();
  }, [data, needsBabyScreen, setProfile, setBabyProfile, completeOnboarding]);

  return {
    data,
    steps,
    totalSteps,
    needsBabyScreen,
    stepIndex,
    toggleRhythm,
    setRhythmLevel,
    setRole,
    toggleGenre,
    setCustomGenre,
    setBabyName,
    setBabyBirthDate,
    canAdvanceFromRhythms,
    canAdvanceFromExperience,
    canAdvanceFromRole,
    canAdvanceFromBabyAge,
    completeFlow,
  };
};
