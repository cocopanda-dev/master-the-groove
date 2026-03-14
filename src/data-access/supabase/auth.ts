// src/data-access/supabase/auth.ts
import { supabase } from './client';

export const initAnonymousAuth = async (): Promise<string> => {
  const { data, error } = await supabase.auth.signInAnonymously();

  if (error) {
    throw new Error(`Anonymous auth failed: ${error.message}`);
  }

  if (!data.user) {
    throw new Error('Anonymous auth returned no user');
  }

  return data.user.id;
};

export const upgradeToEmailAuth = async (email: string, password: string): Promise<void> => {
  const { error } = await supabase.auth.updateUser({ email, password });
  if (error) {
    throw new Error(`Account upgrade failed: ${error.message}`);
  }
};
