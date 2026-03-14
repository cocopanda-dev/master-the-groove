const mockFrom = jest.fn().mockReturnValue({
  upsert: jest.fn().mockResolvedValue({ data: null, error: null }),
  delete: jest.fn().mockReturnValue({
    eq: jest.fn().mockResolvedValue({ data: null, error: null }),
  }),
  select: jest.fn().mockReturnValue({
    eq: jest.fn().mockResolvedValue({ data: [], error: null }),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
  }),
});

const mockAuth = {
  signInAnonymously: jest.fn().mockResolvedValue({
    data: { user: { id: 'test-anon-user-id' } },
    error: null,
  }),
  updateUser: jest.fn().mockResolvedValue({ data: {}, error: null }),
  getSession: jest.fn().mockResolvedValue({
    data: { session: { user: { id: 'test-anon-user-id' } } },
    error: null,
  }),
  onAuthStateChange: jest.fn().mockReturnValue({
    data: { subscription: { unsubscribe: jest.fn() } },
  }),
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: mockFrom,
    auth: mockAuth,
  })),
}));

export { mockFrom, mockAuth };
