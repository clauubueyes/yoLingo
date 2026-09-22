import { Link } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function HomeScreen() {
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.content}>
          <ThemedView style={styles.hero}>
            <ThemedText type="title" style={styles.brand}>
              yoLingo
            </ThemedText>

            <ThemedText type="subtitle" style={styles.welcome}>
              Bienvenido
            </ThemedText>

            <ThemedText themeColor="textSecondary" style={styles.description}>
              La aplicación que te ayuda a aprender y practicar idiomas con rutas
              adaptadas a cada lengua.
            </ThemedText>
          </ThemedView>

          <Link href="/select-language" asChild>
            <Pressable
              style={({ pressed }) => [
                styles.cta,
                { backgroundColor: theme.accent },
                pressed && styles.ctaPressed,
              ]}>
              <ThemedText type="smallBold" style={styles.ctaLabel}>
                Empezar
              </ThemedText>
            </Pressable>
          </Link>
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
    justifyContent: 'center',
    gap: Spacing.six,
    paddingVertical: Spacing.five,
  },
  hero: {
    alignItems: 'center',
    gap: Spacing.three,
  },
  brand: {
    textAlign: 'center',
  },
  welcome: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    maxWidth: 320,
  },
  cta: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 400,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaPressed: {
    opacity: 0.8,
  },
  ctaLabel: {
    color: '#ffffff',
  },
});