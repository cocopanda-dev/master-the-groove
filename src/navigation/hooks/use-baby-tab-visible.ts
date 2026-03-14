import { useUserStore } from '@data-access/stores/use-user-store';

/**
 * Determines whether the Baby tab should be visible in the tab bar.
 *
 * Rules:
 * - Hidden when role === 'musician' AND user has completed onboarding
 * - Visible for 'parent' or 'both' roles
 * - Visible by default if user has not completed onboarding
 */
const useBabyTabVisible = (): boolean => {
  const profile = useUserStore((state) => state.profile);
  const isOnboarded = useUserStore((state) => state.isOnboarded);

  if (!isOnboarded) {
    return true;
  }

  if (!profile) {
    return true;
  }

  return profile.role !== 'musician';
};

export { useBabyTabVisible };
