// src/data-access/stores/__tests__/use-baby-store.test.ts
import { useBabyStore } from '../use-baby-store';
import { act } from '@testing-library/react-native';

describe('useBabyStore', () => {
  beforeEach(() => {
    act(() => useBabyStore.setState(useBabyStore.getInitialState()));
  });

  it('starts with null profile and empty sessions', () => {
    expect(useBabyStore.getState().babyProfile).toBeNull();
    expect(useBabyStore.getState().babySessions).toEqual([]);
  });

  it('setBabyProfile stores the profile', () => {
    const profile = {
      id: 'baby-1',
      userId: 'user-1',
      babyName: 'Luna',
      birthDate: '2025-06-15',
      currentStage: 1 as const,
      stageOverride: null,
    };
    act(() => useBabyStore.getState().setBabyProfile(profile));
    expect(useBabyStore.getState().babyProfile).toEqual(profile);
  });

  it('updateBabyName changes the name', () => {
    act(() => useBabyStore.getState().setBabyProfile({
      id: 'baby-1', userId: 'user-1', babyName: 'Luna',
      birthDate: '2025-06-15', currentStage: 1, stageOverride: null,
    }));
    act(() => useBabyStore.getState().updateBabyName('Sol'));
    expect(useBabyStore.getState().babyProfile?.babyName).toBe('Sol');
  });

  it('logBabySession adds to sessions array', () => {
    act(() => useBabyStore.getState().logBabySession({
      babyProfileId: 'baby-1',
      activityType: 'bounce',
      duration: 120,
      babyResponse: 'excited',
      completedAt: '2026-01-01T00:00:00Z',
    }));
    expect(useBabyStore.getState().babySessions).toHaveLength(1);
    expect(useBabyStore.getState().babySessions[0]?.activityType).toBe('bounce');
    expect(useBabyStore.getState().babySessions[0]?.id).toBeDefined();
  });

  it('clearBabyProfile resets all state', () => {
    act(() => {
      useBabyStore.getState().setBabyProfile({
        id: 'baby-1', userId: 'user-1', babyName: 'Luna',
        birthDate: '2025-06-15', currentStage: 1, stageOverride: null,
      });
      useBabyStore.getState().clearBabyProfile();
    });
    expect(useBabyStore.getState().babyProfile).toBeNull();
  });
});
