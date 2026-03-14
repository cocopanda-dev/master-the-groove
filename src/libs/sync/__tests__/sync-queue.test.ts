// src/libs/sync/__tests__/sync-queue.test.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addToQueue, getQueue, removeFromQueue, clearQueue } from '../sync-queue';

describe('SyncQueue', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('starts empty', async () => {
    const queue = await getQueue();
    expect(queue).toEqual([]);
  });

  it('addToQueue appends an item', async () => {
    await addToQueue({ table: 'sessions', operation: 'upsert', payload: { id: '1' } });
    const queue = await getQueue();
    expect(queue).toHaveLength(1);
    expect(queue[0]?.table).toBe('sessions');
    expect(queue[0]?.retryCount).toBe(0);
  });

  it('items have auto-generated id and queuedAt', async () => {
    await addToQueue({ table: 'users', operation: 'upsert', payload: { id: 'u1' } });
    const queue = await getQueue();
    expect(queue[0]?.id).toBeDefined();
    expect(queue[0]?.queuedAt).toBeDefined();
  });

  it('removeFromQueue removes by id', async () => {
    await addToQueue({ table: 'sessions', operation: 'upsert', payload: { id: '1' } });
    const queue = await getQueue();
    await removeFromQueue(queue[0]?.id ?? '');
    const after = await getQueue();
    expect(after).toHaveLength(0);
  });

  it('clearQueue removes all items', async () => {
    await addToQueue({ table: 'sessions', operation: 'upsert', payload: { id: '1' } });
    await addToQueue({ table: 'users', operation: 'upsert', payload: { id: '2' } });
    await clearQueue();
    expect(await getQueue()).toEqual([]);
  });

  it('maintains FIFO order', async () => {
    await addToQueue({ table: 'sessions', operation: 'upsert', payload: { id: 'first' } });
    await addToQueue({ table: 'sessions', operation: 'upsert', payload: { id: 'second' } });
    const queue = await getQueue();
    expect(queue[0]?.payload.id).toBe('first');
    expect(queue[1]?.payload.id).toBe('second');
  });
});
