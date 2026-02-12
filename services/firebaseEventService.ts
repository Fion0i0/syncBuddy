import { db } from './firebase';
import {
  ref,
  set,
  remove,
  update,
  onValue,
  off,
  DataSnapshot,
} from 'firebase/database';
import { ScheduleEvent } from '../types';

const EVENTS_PATH = 'events';

export function subscribeToEvents(
  callback: (events: ScheduleEvent[]) => void,
  onError?: (error: Error) => void
): () => void {
  if (!db) {
    if (onError) onError(new Error('Firebase not initialized'));
    return () => {};
  }

  const eventsRef = ref(db, EVENTS_PATH);

  const handleValue = (snapshot: DataSnapshot) => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
      return;
    }
    const events: ScheduleEvent[] = Object.values(data);
    callback(events);
  };

  const handleError = (error: Error) => {
    console.error('Firebase listener error:', error);
    if (onError) onError(error);
  };

  onValue(eventsRef, handleValue, handleError);

  return () => off(eventsRef, 'value', handleValue);
}

export async function addEvent(event: ScheduleEvent): Promise<void> {
  if (!db) throw new Error('Firebase not initialized');
  const eventRef = ref(db, `${EVENTS_PATH}/${event.id}`);
  await set(eventRef, event);
}

export async function updateEvents(
  updates: Record<string, Partial<ScheduleEvent>>
): Promise<void> {
  if (!db) throw new Error('Firebase not initialized');
  const flatUpdates: Record<string, unknown> = {};
  for (const [eventId, fields] of Object.entries(updates)) {
    for (const [key, value] of Object.entries(fields)) {
      flatUpdates[`${EVENTS_PATH}/${eventId}/${key}`] = value;
    }
  }
  const rootRef = ref(db);
  await update(rootRef, flatUpdates);
}

export async function removeEvents(eventIds: string[]): Promise<void> {
  if (!db) throw new Error('Firebase not initialized');
  const rootRef = ref(db);
  const nullUpdates: Record<string, null> = {};
  for (const id of eventIds) {
    nullUpdates[`${EVENTS_PATH}/${id}`] = null;
  }
  await update(rootRef, nullUpdates);
}
