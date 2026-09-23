import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.content}>
          <ThemedView style={styles.hero}>
            <ThemedText type="title" style={[styles.brand, { color: theme.accent }]}>
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

          <Pressable
            accessibilityRole="button"
            onBlur={() => setIsFocused(false)}
            onFocus={() => setIsFocused(true)}
            onHoverIn={() => setIsHovered(true)}
            onHoverOut={() => setIsHovered(false)}
            onPress={() => router.push('/select-language')}
            style={({ pressed }) => [
              styles.cta,
              {
                backgroundColor: pressed
                  ? theme.accentPressed
                  : isHovered
                    ? theme.accentHover
                    : theme.accent,
                borderColor: isFocused ? theme.focusRing : 'transparent',
              },
              pressed && styles.ctaPressed,
            ]}>
            <ThemedText
              type="smallBold"
              style={[styles.ctaLabel, { color: theme.accentText }]}>
              Empezar
            </ThemedText>
          </Pressable>
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
    minHeight: 52,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderWidth: 3,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  ctaPressed: {
    transform: [{ scale: 0.98 }],
  },
  ctaLabel: {
    fontSize: 16,
    lineHeight: 24,
  },
});
