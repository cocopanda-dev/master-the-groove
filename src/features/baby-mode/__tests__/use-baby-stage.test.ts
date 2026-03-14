// src/features/baby-mode/__tests__/use-baby-stage.test.ts
import { renderHook } from '@testing-library/react-native';
import { useBabyStore } from '@data-access/stores';
import { useBabyStage } from '../hooks/use-baby-stage';

// Mock calculateStageFromBirthDate
jest.mock('@operations/baby/calculate-stage', () => ({
  calculateStageFromBirthDate: jest.fn().mockReturnValue(2),
}));

describe('useBabyStage', () => {
  beforeEach(() => {
    useBabyStore.setState({
      babyProfile: null,
      babySessions: [],
    });
  });

  it('returns default values when no profile exists', () => {
    const { result } = renderHook(() => useBabyStage());

    expect(result.current.hasProfile).toBe(false);
    expect(result.current.babyName).toBe('Your little one');
    expect(result.current.stage).toBe(1);
  });

  it('computes stage from birth date when profile exists', () => {
    useBabyStore.setState({
      babyProfile: {
        id: 'test-id',
        userId: 'user-1',
        babyName: 'Luna',
        birthDate: '2025-06-01',
        currentStage: 2,
        stageOverride: null,
      },
    });

    const { result } = renderHook(() => useBabyStage());

    expect(result.current.hasProfile).toBe(true);
    expect(result.current.babyName).toBe('Luna');
    expect(result.current.stage).toBe(2);
    expect(result.current.isOverridden).toBe(false);
  });

  it('uses stage override when set', () => {
    useBabyStore.setState({
      babyProfile: {
        id: 'test-id',
        userId: 'user-1',
        babyName: 'Luna',
        birthDate: '2025-06-01',
        currentStage: 2,
        stageOverride: 3,
      },
    });

    const { result } = renderHook(() => useBabyStage());

    expect(result.current.stage).toBe(3);
    expect(result.current.isOverridden).toBe(true);
  });

  it('clamps stage to MVP range (1-3)', () => {
    useBabyStore.setState({
      babyProfile: {
        id: 'test-id',
        userId: 'user-1',
        babyName: 'Luna',
        birthDate: '2025-06-01',
        currentStage: 2,
        stageOverride: 5,
      },
    });

    const { result } = renderHook(() => useBabyStage());

    expect(result.current.stage).toBe(3);
  });

  it('uses fallback name when babyName is empty', () => {
    useBabyStore.setState({
      babyProfile: {
        id: 'test-id',
        userId: 'user-1',
        babyName: '',
        birthDate: '2025-06-01',
        currentStage: 2,
        stageOverride: null,
      },
    });

    const { result } = renderHook(() => useBabyStage());

    expect(result.current.babyName).toBe('Your little one');
  });
});
