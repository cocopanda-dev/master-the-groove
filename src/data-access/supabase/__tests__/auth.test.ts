// src/data-access/supabase/__tests__/auth.test.ts
import { initAnonymousAuth } from '../auth';
import { mockAuth } from '../../../__tests__/mocks/supabase';

describe('initAnonymousAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset to default success mock
    mockAuth.signInAnonymously.mockResolvedValue({
      data: { user: { id: 'test-anon-user-id' } },
      error: null,
    });
  });

  it('returns a user ID on success', async () => {
    const userId = await initAnonymousAuth();
    expect(userId).toBe('test-anon-user-id');
  });

  it('throws on auth error', async () => {
    mockAuth.signInAnonymously.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Auth failed' },
    });

    await expect(initAnonymousAuth()).rejects.toThrow('Anonymous auth failed: Auth failed');
  });

  it('throws when no user is returned', async () => {
    mockAuth.signInAnonymously.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    await expect(initAnonymousAuth()).rejects.toThrow('Anonymous auth returned no user');
  });
});
