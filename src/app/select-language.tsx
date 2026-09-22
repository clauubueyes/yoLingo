import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

export default function SelectLanguageScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.content}>
          <ThemedView style={styles.header}>
            <ThemedText type="subtitle" style={styles.title}>
              Selecciona tu idioma
            </ThemedText>

            <ThemedText themeColor="textSecondary" style={styles.description}>
              Elige el idioma que quieres aprender y empieza a practicar desde hoy.
            </ThemedText>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.optionsContainer} />
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
  },
  content: {
    flex: 1,
    paddingVertical: Spacing.five,
    gap: Spacing.four,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.three,
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    maxWidth: 320,
  },
  optionsContainer: {
    minHeight: 220,
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.three,
  },
});