// src/features/feel-lessons/components/DisappearingStep.tsx
import React, { useCallback, useMemo } from 'react';
import { DisappearingBeatInline } from '@features/disappearing-beat';
import type { StageConfig, DisappearingBeatResult } from '@features/disappearing-beat';
import type { LessonStep } from '@types';

interface DisappearingStepProps {
  readonly step: LessonStep;
  readonly onComplete?: () => void;
  readonly isCompleted: boolean;
}

/**
 * Lesson Step 7: Disappearing Beat challenge.
 * Wraps DisappearingBeatInline with config derived from the lesson step data.
 */
export const DisappearingStep = ({ step, onComplete }: DisappearingStepProps) => {
  const config = useMemo((): StageConfig => {
    const ic = step.interactionConfig as {
      targetLayer?: string;
      barsPerStage?: number;
    } | undefined;

    return {
      ratioA: step.audioConfig?.ratioA ?? 3,
      ratioB: step.audioConfig?.ratioB ?? 2,
      bpm: step.audioConfig?.bpm ?? 72,
      targetLayer: (ic?.targetLayer === 'B' ? 'B' : 'A') as 'A' | 'B',
      barsPerStage: ic?.barsPerStage ?? 4,
      returnCycles: 2,
    };
  }, [step.audioConfig, step.interactionConfig]);

  const handleComplete = useCallback(
    (_result: DisappearingBeatResult) => {
      onComplete?.();
    },
    [onComplete],
  );

  return <DisappearingBeatInline config={config} onComplete={handleComplete} />;
};
