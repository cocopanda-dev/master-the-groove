// src/libs/sync/sync-queue.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from '@libs/uuid';

const QUEUE_KEY = 'groovecore:sync-queue';

type SyncTable = 'users' | 'sessions' | 'baby_profiles' | 'baby_sessions' | 'lesson_progress';

export type SyncQueueItem = {
  id: string;
  table: SyncTable;
  operation: 'upsert' | 'delete';
  payload: Record<string, unknown>;
  queuedAt: string;
  retryCount: number;
};

type AddParams = {
  table: SyncTable;
  operation: 'upsert' | 'delete';
  payload: Record<string, unknown>;
};

export const getQueue = async (): Promise<SyncQueueItem[]> => {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as SyncQueueItem[];
};

const saveQueue = async (queue: SyncQueueItem[]): Promise<void> => {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

export const addToQueue = async (params: AddParams): Promise<void> => {
  const queue = await getQueue();
  const item: SyncQueueItem = {
    id: generateId(),
    table: params.table,
    operation: params.operation,
    payload: params.payload,
    queuedAt: new Date().toISOString(),
    retryCount: 0,
  };
  queue.push(item);
  await saveQueue(queue);
};

export const removeFromQueue = async (id: string): Promise<void> => {
  const queue = await getQueue();
  await saveQueue(queue.filter((item) => item.id !== id));
};

export const updateQueueItem = async (id: string, updates: Partial<SyncQueueItem>): Promise<void> => {
  const queue = await getQueue();
  const index = queue.findIndex((item) => item.id === id);
  if (index >= 0 && queue[index]) {
    queue[index] = { ...queue[index], ...updates } as SyncQueueItem;
    await saveQueue(queue);
  }
};

export const clearQueue = async (): Promise<void> => {
  await AsyncStorage.removeItem(QUEUE_KEY);
};
