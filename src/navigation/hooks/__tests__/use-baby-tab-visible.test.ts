import { renderHook } from '@testing-library/react-native';
import { useBabyTabVisible } from '../use-baby-tab-visible';

// Mock the user store
const mockUserStore = {
  profile: {
    id: 'user-1',
    displayName: null,
    email: null,
    role: 'both' as 'musician' | 'parent' | 'both',
    selectedRhythms: [],
    genrePreferences: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  } as {
    id: string;
    displayName: null;
    email: null;
    role: 'musician' | 'parent' | 'both';
    selectedRhythms: string[];
    genrePreferences: string[];
    createdAt: string;
    updatedAt: string;
  } | null,
  isOnboarded: true,
};

jest.mock('@data-access/stores/use-user-store', () => ({
  useUserStore: (selector: (state: typeof mockUserStore) => unknown) => selector(mockUserStore),
}));

describe('useBabyTabVisible', () => {
  beforeEach(() => {
    mockUserStore.profile = {
      id: 'user-1',
      displayName: null,
      email: null,
      role: 'both',
      selectedRhythms: [],
      genrePreferences: [],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    mockUserStore.isOnboarded = true;
  });

  it('returns true when role is "parent"', () => {
    if (mockUserStore.profile) mockUserStore.profile.role = 'parent';
    const { result } = renderHook(() => useBabyTabVisible());
    expect(result.current).toBe(true);
  });

  it('returns true when role is "both"', () => {
    if (mockUserStore.profile) mockUserStore.profile.role = 'both';
    const { result } = renderHook(() => useBabyTabVisible());
    expect(result.current).toBe(true);
  });

  it('returns false when role is "musician"', () => {
    if (mockUserStore.profile) mockUserStore.profile.role = 'musician';
    const { result } = renderHook(() => useBabyTabVisible());
    expect(result.current).toBe(false);
  });

  it('returns true when user is not onboarded (default visibility)', () => {
    mockUserStore.isOnboarded = false;
    if (mockUserStore.profile) mockUserStore.profile.role = 'musician';
    const { result } = renderHook(() => useBabyTabVisible());
    expect(result.current).toBe(true);
  });
});
