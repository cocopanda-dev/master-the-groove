// src/libs/sync/__tests__/sync-service.test.ts
import { flushSyncQueue } from '../sync-service';
import { addToQueue, getQueue } from '../sync-queue';
import { mockFrom } from '../../../__tests__/mocks/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('flushSyncQueue', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
    // Reset default mock: upsert returns no error
    mockFrom.mockReturnValue({
      upsert: jest.fn().mockResolvedValue({ data: null, error: null }),
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: null, error: null }),
      }),
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: [], error: null }),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      }),
    });
  });

  it('does nothing when queue is empty', async () => {
    await flushSyncQueue();
    // No errors thrown
  });

  it('processes items and removes them on success', async () => {
    await addToQueue({ table: 'sessions', operation: 'upsert', payload: { id: '1' } });
    await addToQueue({ table: 'sessions', operation: 'upsert', payload: { id: '2' } });
    await flushSyncQueue();
    const remaining = await getQueue();
    expect(remaining).toHaveLength(0);
  });

  it('increments retryCount on failure and stops', async () => {
    const mockUpsert = jest.fn().mockResolvedValue({ data: null, error: { message: 'Network error' } });
    mockFrom.mockReturnValue({
      upsert: mockUpsert,
    });

    await addToQueue({ table: 'sessions', operation: 'upsert', payload: { id: '1' } });
    await flushSyncQueue();
    const queue = await getQueue();
    expect(queue[0]?.retryCount).toBe(1);
  });

  it('removes items after 5 failures (dead letter)', async () => {
    // Manually set item with retryCount 4
    await addToQueue({ table: 'sessions', operation: 'upsert', payload: { id: '1' } });
    const queue = await getQueue();
    if (queue[0]) {
      queue[0].retryCount = 4;
      await AsyncStorage.setItem('groovecore:sync-queue', JSON.stringify(queue));
    }

    const mockUpsert = jest.fn().mockResolvedValue({ data: null, error: { message: 'fail' } });
    mockFrom.mockReturnValue({
      upsert: mockUpsert,
    });

    await flushSyncQueue();
    const remaining = await getQueue();
    expect(remaining).toHaveLength(0); // dead lettered
  });
});
