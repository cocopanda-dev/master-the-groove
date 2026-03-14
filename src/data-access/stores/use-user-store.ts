// src/data-access/stores/use-user-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { asyncStorageAdapter } from './create-persisted-store';
import { registerResetFn } from './store-reset';
import type { UserProfile } from '@types';

type UserState = {
  profile: UserProfile | null;
  isOnboarded: boolean;
  isAnonymous: boolean;
};

type UserActions = {
  setProfile: (profile: UserProfile) => void;
  completeOnboarding: () => void;
  updateRole: (role: UserProfile['role']) => void;
  updateGenrePreferences: (genres: string[]) => void;
  upgradeFromAnonymous: (email: string, name: string) => void;
  clearProfile: () => void;
};

const INITIAL_STATE: UserState = {
  profile: null,
  isOnboarded: false,
  isAnonymous: true,
};

export const useUserStore = create<UserState & UserActions>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      setProfile: (profile) => set({ profile }),

      completeOnboarding: () => set({ isOnboarded: true }),

      updateRole: (role) => {
        const { profile } = get();
        if (!profile) return;
        set({ profile: { ...profile, role, updatedAt: new Date().toISOString() } });
      },

      updateGenrePreferences: (genres) => {
        const { profile } = get();
        if (!profile) return;
        set({ profile: { ...profile, genrePreferences: genres, updatedAt: new Date().toISOString() } });
      },

      upgradeFromAnonymous: (email, name) => {
        const { profile } = get();
        if (!profile) return;
        set({
          isAnonymous: false,
          profile: { ...profile, email, displayName: name, updatedAt: new Date().toISOString() },
        });
      },

      clearProfile: () => set(INITIAL_STATE),
    }),
    {
      name: 'user-store',
      storage: asyncStorageAdapter,
    },
  ),
);

registerResetFn(() => useUserStore.setState(INITIAL_STATE));
