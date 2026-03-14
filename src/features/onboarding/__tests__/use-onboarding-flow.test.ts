// src/features/onboarding/__tests__/use-onboarding-flow.test.ts
import { renderHook, act } from '@testing-library/react-native';
import { useOnboardingFlow } from '../hooks/use-onboarding-flow';

// Mock the stores
const mockSetProfile = jest.fn();
const mockCompleteOnboarding = jest.fn();
const mockSetBabyProfile = jest.fn();

jest.mock('@data-access/stores/use-user-store', () => ({
  useUserStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      setProfile: mockSetProfile,
      completeOnboarding: mockCompleteOnboarding,
    }),
}));

jest.mock('@data-access/stores/use-baby-store', () => ({
  useBabyStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      setBabyProfile: mockSetBabyProfile,
    }),
}));

jest.mock('uuid', () => ({
  v4: () => 'test-uuid-1234',
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useOnboardingFlow', () => {
  describe('initial state', () => {
    it('starts with empty onboarding data', () => {
      const { result } = renderHook(() => useOnboardingFlow());

      expect(result.current.data.selectedRhythms).toEqual([]);
      expect(result.current.data.rhythmLevel).toBeNull();
      expect(result.current.data.role).toBeNull();
      expect(result.current.data.genrePreferences).toEqual([]);
      expect(result.current.data.babyName).toBe('');
      expect(result.current.data.babyBirthDate).toBeNull();
    });

    it('defaults to parent steps (5 steps) when role is not set', () => {
      const { result } = renderHook(() => useOnboardingFlow());

      // Default is PARENT_STEPS since role is null (not 'musician')
      expect(result.current.totalSteps).toBe(5);
    });
  });

  describe('conditional flow logic', () => {
    it('shows 4 steps when role is musician', () => {
      const { result } = renderHook(() => useOnboardingFlow());

      act(() => {
        result.current.setRole('musician');
      });

      expect(result.current.totalSteps).toBe(4);
      expect(result.current.needsBabyScreen).toBe(false);
      expect(result.current.steps).toEqual([
        'rhythms',
        'experience',
        'role',
        'genres',
      ]);
    });

    it('shows 5 steps when role is parent', () => {
      const { result } = renderHook(() => useOnboardingFlow());

      act(() => {
        result.current.setRole('parent');
      });

      expect(result.current.totalSteps).toBe(5);
      expect(result.current.needsBabyScreen).toBe(true);
      expect(result.current.steps).toEqual([
        'rhythms',
        'experience',
        'role',
        'genres',
        'baby-age',
      ]);
    });

    it('shows 5 steps when role is both', () => {
      const { result } = renderHook(() => useOnboardingFlow());

      act(() => {
        result.current.setRole('both');
      });

      expect(result.current.totalSteps).toBe(5);
      expect(result.current.needsBabyScreen).toBe(true);
    });
  });

  describe('rhythm selection', () => {
    it('toggles rhythm selection on', () => {
      const { result } = renderHook(() => useOnboardingFlow());

      act(() => {
        result.current.toggleRhythm('3-2');
      });

      expect(result.current.data.selectedRhythms).toEqual(['3-2']);
      expect(result.current.canAdvanceFromRhythms).toBe(true);
    });

    it('toggles rhythm selection off', () => {
      const { result } = renderHook(() => useOnboardingFlow());

      act(() => {
        result.current.toggleRhythm('3-2');
      });
      act(() => {
        result.current.toggleRhythm('3-2');
      });

      expect(result.current.data.selectedRhythms).toEqual([]);
      expect(result.current.canAdvanceFromRhythms).toBe(false);
    });

    it('requires at least one rhythm to advance', () => {
      const { result } = renderHook(() => useOnboardingFlow());

      expect(result.current.canAdvanceFromRhythms).toBe(false);

      act(() => {
        result.current.toggleRhythm('4-3');
      });

      expect(result.current.canAdvanceFromRhythms).toBe(true);
    });

    it('supports multi-select', () => {
      const { result } = renderHook(() => useOnboardingFlow());

      act(() => {
        result.current.toggleRhythm('3-2');
      });
      act(() => {
        result.current.toggleRhythm('4-3');
      });

      expect(result.current.data.selectedRhythms).toEqual(['3-2', '4-3']);
    });
  });

  describe('experience level', () => {
    it('sets rhythm level', () => {
      const { result } = renderHook(() => useOnboardingFlow());

      act(() => {
        result.current.setRhythmLevel('intermediate');
      });

      expect(result.current.data.rhythmLevel).toBe('intermediate');
      expect(result.current.canAdvanceFromExperience).toBe(true);
    });

    it('cannot advance without rhythm level', () => {
      const { result } = renderHook(() => useOnboardingFlow());
      expect(result.current.canAdvanceFromExperience).toBe(false);
    });
  });

  describe('genre selection', () => {
    it('toggles genre on and off', () => {
      const { result } = renderHook(() => useOnboardingFlow());

      act(() => {
        result.current.toggleGenre('Jazz');
      });

      expect(result.current.data.genrePreferences).toEqual(['Jazz']);

      act(() => {
        result.current.toggleGenre('Jazz');
      });

      expect(result.current.data.genrePreferences).toEqual([]);
    });

    it('supports multi-select genres', () => {
      const { result } = renderHook(() => useOnboardingFlow());

      act(() => {
        result.current.toggleGenre('Jazz');
      });
      act(() => {
        result.current.toggleGenre('Rock');
      });
      act(() => {
        result.current.toggleGenre('Hip-Hop');
      });

      expect(result.current.data.genrePreferences).toEqual([
        'Jazz',
        'Rock',
        'Hip-Hop',
      ]);
    });

    it('stores custom genre text', () => {
      const { result } = renderHook(() => useOnboardingFlow());

      act(() => {
        result.current.setCustomGenre('Bluegrass');
      });

      expect(result.current.data.customGenre).toBe('Bluegrass');
    });
  });

  describe('completion flow', () => {
    it('calls setProfile and completeOnboarding for musician', () => {
      const { result } = renderHook(() => useOnboardingFlow());

      act(() => {
        result.current.toggleRhythm('3-2');
        result.current.setRhythmLevel('beginner');
        result.current.setRole('musician');
        result.current.toggleGenre('Jazz');
      });

      act(() => {
        result.current.completeFlow();
      });

      expect(mockSetProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-uuid-1234',
          role: 'musician',
          rhythmLevel: 'beginner',
          selectedRhythms: ['3-2'],
          genrePreferences: ['Jazz'],
        }),
      );
      expect(mockCompleteOnboarding).toHaveBeenCalled();
      expect(mockSetBabyProfile).not.toHaveBeenCalled();
    });

    it('calls setBabyProfile for parent', () => {
      const { result } = renderHook(() => useOnboardingFlow());

      act(() => {
        result.current.toggleRhythm('3-2');
        result.current.setRhythmLevel('advanced');
        result.current.setRole('parent');
        result.current.setBabyName('Luna');
        result.current.setBabyBirthDate('2025-06-15');
      });

      act(() => {
        result.current.completeFlow();
      });

      expect(mockSetProfile).toHaveBeenCalled();
      expect(mockSetBabyProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          babyName: 'Luna',
          birthDate: '2025-06-15',
          stageOverride: null,
        }),
      );
      expect(mockCompleteOnboarding).toHaveBeenCalled();
    });

    it('defaults baby name to "Baby" when empty', () => {
      const { result } = renderHook(() => useOnboardingFlow());

      act(() => {
        result.current.toggleRhythm('3-2');
        result.current.setRhythmLevel('beginner');
        result.current.setRole('parent');
        result.current.setBabyBirthDate('2025-06-15');
      });

      act(() => {
        result.current.completeFlow();
      });

      expect(mockSetBabyProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          babyName: 'Baby',
        }),
      );
    });

    it('replaces "Other" genre with custom text', () => {
      const { result } = renderHook(() => useOnboardingFlow());

      act(() => {
        result.current.toggleRhythm('3-2');
        result.current.setRhythmLevel('beginner');
        result.current.setRole('musician');
        result.current.toggleGenre('Other');
        result.current.setCustomGenre('Bluegrass');
      });

      act(() => {
        result.current.completeFlow();
      });

      expect(mockSetProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          genrePreferences: ['Bluegrass'],
        }),
      );
    });

    it('removes "Other" if custom text is empty', () => {
      const { result } = renderHook(() => useOnboardingFlow());

      act(() => {
        result.current.toggleRhythm('3-2');
        result.current.setRhythmLevel('beginner');
        result.current.setRole('musician');
        result.current.toggleGenre('Jazz');
        result.current.toggleGenre('Other');
        result.current.setCustomGenre('   ');
      });

      act(() => {
        result.current.completeFlow();
      });

      expect(mockSetProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          genrePreferences: ['Jazz'],
        }),
      );
    });
  });

  describe('stepIndex', () => {
    it('returns correct index for each step', () => {
      const { result } = renderHook(() => useOnboardingFlow());

      act(() => {
        result.current.setRole('parent');
      });

      expect(result.current.stepIndex('rhythms')).toBe(0);
      expect(result.current.stepIndex('experience')).toBe(1);
      expect(result.current.stepIndex('role')).toBe(2);
      expect(result.current.stepIndex('genres')).toBe(3);
      expect(result.current.stepIndex('baby-age')).toBe(4);
    });

    it('returns -1 for baby-age when musician', () => {
      const { result } = renderHook(() => useOnboardingFlow());

      act(() => {
        result.current.setRole('musician');
      });

      expect(result.current.stepIndex('baby-age')).toBe(-1);
    });
  });
});
