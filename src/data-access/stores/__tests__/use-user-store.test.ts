// src/data-access/stores/__tests__/use-user-store.test.ts
import { useUserStore } from '../use-user-store';
import { act } from '@testing-library/react-native';

describe('useUserStore', () => {
  beforeEach(() => {
    act(() => useUserStore.setState(useUserStore.getInitialState()));
  });

  it('starts with null profile and not onboarded', () => {
    const state = useUserStore.getState();
    expect(state.profile).toBeNull();
    expect(state.isOnboarded).toBe(false);
    expect(state.isAnonymous).toBe(true);
  });

  it('setProfile stores the user profile', () => {
    const profile = {
      id: 'user-123',
      displayName: null,
      email: null,
      role: 'musician' as const,
      rhythmLevel: 'beginner' as const,
      selectedRhythms: ['3-2'],
      genrePreferences: ['jazz'],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };
    act(() => useUserStore.getState().setProfile(profile));
    expect(useUserStore.getState().profile).toEqual(profile);
  });

  it('completeOnboarding sets flag to true', () => {
    act(() => useUserStore.getState().completeOnboarding());
    expect(useUserStore.getState().isOnboarded).toBe(true);
  });

  it('updateRole changes the profile role', () => {
    const profile = {
      id: 'user-123',
      displayName: null,
      email: null,
      role: 'musician' as const,
      rhythmLevel: 'beginner' as const,
      selectedRhythms: [],
      genrePreferences: [],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };
    act(() => useUserStore.getState().setProfile(profile));
    act(() => useUserStore.getState().updateRole('both'));
    expect(useUserStore.getState().profile?.role).toBe('both');
  });

  it('updateRole is no-op when profile is null', () => {
    act(() => useUserStore.getState().updateRole('parent'));
    expect(useUserStore.getState().profile).toBeNull();
  });

  it('upgradeFromAnonymous sets email and flips flag', () => {
    const profile = {
      id: 'user-123',
      displayName: null,
      email: null,
      role: 'musician' as const,
      rhythmLevel: 'beginner' as const,
      selectedRhythms: [],
      genrePreferences: [],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };
    act(() => useUserStore.getState().setProfile(profile));
    act(() => useUserStore.getState().upgradeFromAnonymous('test@example.com', 'Test User'));
    expect(useUserStore.getState().isAnonymous).toBe(false);
    expect(useUserStore.getState().profile?.email).toBe('test@example.com');
    expect(useUserStore.getState().profile?.displayName).toBe('Test User');
  });

  it('clearProfile resets to initial state', () => {
    act(() => {
      useUserStore.getState().setProfile({
        id: 'user-123',
        displayName: 'Test',
        email: 'test@test.com',
        role: 'both',
        rhythmLevel: 'beginner' as const,
        selectedRhythms: ['3-2'],
        genrePreferences: ['jazz'],
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      });
      useUserStore.getState().clearProfile();
    });
    expect(useUserStore.getState().profile).toBeNull();
    expect(useUserStore.getState().isAnonymous).toBe(true);
  });
});
