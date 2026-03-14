// src/libs/sync/sync-service.ts
import { supabase } from '@data-access/supabase';
import { getQueue, removeFromQueue, updateQueueItem } from './sync-queue';
import type { SyncQueueItem } from './sync-queue';

const MAX_RETRIES = 5;

const syncItem = async (item: SyncQueueItem): Promise<void> => {
  if (item.operation === 'upsert') {
    const { error } = await supabase
      .from(item.table)
      .upsert(item.payload, { onConflict: 'id' });
    if (error) throw error;
  }

  if (item.operation === 'delete') {
    const { error } = await supabase
      .from(item.table)
      .delete()
      .eq('id', item.payload.id as string);
    if (error) throw error;
  }
};

export const flushSyncQueue = async (): Promise<void> => {
  const queue = await getQueue();
  if (queue.length === 0) return;

  const sorted = [...queue].sort((a, b) => a.queuedAt.localeCompare(b.queuedAt));

  for (const item of sorted) {
    try {
      await syncItem(item);
      await removeFromQueue(item.id);
    } catch {
      const newRetryCount = item.retryCount + 1;
      if (newRetryCount >= MAX_RETRIES) {
        console.error(`[SyncService] Dead letter: ${item.table}:${item.id} after ${MAX_RETRIES} failures`);
        await removeFromQueue(item.id);
      } else {
        await updateQueueItem(item.id, { retryCount: newRetryCount });
      }
      break; // stop on first error
    }
  }
};
