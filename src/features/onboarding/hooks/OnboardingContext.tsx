// src/features/onboarding/hooks/OnboardingContext.tsx
import React, { createContext, useContext } from 'react';
import { useOnboardingFlow } from './use-onboarding-flow';

type OnboardingContextValue = ReturnType<typeof useOnboardingFlow>;

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export const OnboardingProvider = ({ children }: { children: React.ReactNode }) => {
  const flow = useOnboardingFlow();

  return (
    <OnboardingContext.Provider value={flow}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboardingContext = (): OnboardingContextValue => {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error('useOnboardingContext must be used within OnboardingProvider');
  }
  return ctx;
};
