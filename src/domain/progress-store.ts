import { completeLesson } from './progress.ts';

export type ProgressStorage = Readonly<{
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
}>;

function decodeCompleted(raw: string | null): readonly string[] {
  if (raw === null) return [];

  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return [];
  }

  if (!Array.isArray(value)) return [];
  // Recover valid IDs from partially corrupt arrays without discarding progress.
  return [...new Set(value.filter(
    (id): id is string => typeof id === 'string' && id.trim().length > 0,
  ))];
}

/** Use one store instance per storage backend to serialize read/modify/write operations. */
export function createProgressStore(storage: ProgressStorage) {
  let pending: Promise<unknown> = Promise.resolve();

  function enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const result = pending.then(operation);
    // A failed operation is reported to its caller but does not block later retries.
    pending = result.catch(() => undefined);
    return result;
  }

  function keyFor(pathId: string): string {
    if (pathId.trim().length === 0) throw new Error('A progress path ID is required.');
    return `yolingo:progress:v1:${encodeURIComponent(pathId)}`;
  }

  return {
    readCompleted(pathId: string): Promise<readonly string[]> {
      return enqueue(async () => decodeCompleted(await storage.getItem(keyFor(pathId))));
    },

    completeLesson(pathId: string, lessonId: string): Promise<readonly string[]> {
      return enqueue(async () => {
        if (lessonId.trim().length === 0) throw new Error('A lesson ID is required.');
        const key = keyFor(pathId);
        const previous = decodeCompleted(await storage.getItem(key));
        const completed = completeLesson(previous, lessonId);
        await storage.setItem(key, JSON.stringify(completed));
        return completed;
      });
    },
  };
}
