import { useSyncExternalStore } from 'react';
import { Appearance } from 'react-native';

function subscribe(onChange: () => void) {
  const subscription = Appearance.addChangeListener(onChange);
  return () => subscription.remove();
}

// Keep server rendering and initial hydration consistent before reading the browser theme.
function getServerSnapshot() {
  return 'light' as const;
}

export function useColorScheme() {
  return useSyncExternalStore(subscribe, Appearance.getColorScheme, getServerSnapshot);
}
