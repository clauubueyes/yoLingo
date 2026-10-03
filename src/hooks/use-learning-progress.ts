import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { progressStore } from '@/stores/progress';

/** Re-read persisted progress on focus, including after returning from a lesson. */
export function useLearningProgress(pathId: string) {
  const [completed, setCompleted] = useState<readonly string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const version = useRef(0);

  const reload = useCallback(() => {
    const request = ++version.current;
    setCompleted(null);
    setError(null);

    progressStore.readCompleted(pathId).then(
      (ids) => { if (request === version.current) setCompleted(ids); },
      () => { if (request === version.current) setError('No se pudo cargar tu progreso. Inténtalo de nuevo.'); },
    );
  }, [pathId]);

  useFocusEffect(useCallback(() => {
    reload();
    return () => { version.current += 1; };
  }, [reload]));

  return { completed, error, reload };
}
