export const mockSupabaseClient = {
  auth: {
    signInAnonymously: jest.fn().mockResolvedValue({
      data: { user: { id: 'mock-user-id' } },
      error: null,
    }),
    getSession: jest.fn().mockResolvedValue({
      data: { session: { access_token: 'mock-token' } },
      error: null,
    }),
    onAuthStateChange: jest.fn().mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    }),
  },
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
  }),
};

jest.mock('@data-access/supabase', () => ({
  supabase: mockSupabaseClient,
}));
