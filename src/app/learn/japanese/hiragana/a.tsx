import { Image } from 'expo-image';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton } from '@/components/back-button';
import { ExternalLink } from '@/components/external-link';
import { KanaStrokeDemo } from '@/components/kana-stroke-demo';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { hiraganaA } from '@/content/japanese/hiragana';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function HiraganaALessonScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 900;
  const theme = useTheme();
  const [replayKey, setReplayKey] = useState(0);
  const [isPracticeStarted, setIsPracticeStarted] = useState(false);
  const [focusedButton, setFocusedButton] = useState<'replay' | 'practice' | null>(null);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          alwaysBounceVertical={false}
          contentContainerStyle={[styles.content, isDesktop && styles.desktopContent]}>
          <View style={[styles.topBar, isDesktop && styles.desktopTopBar]}>
            <BackButton
              accessibilityLabel="Volver a seleccionar idioma"
              fallbackHref="/select-language"
              style={isDesktop && styles.desktopBackButton}
            />

            <View style={styles.brand}>
              <Image
                accessible={false}
                contentFit="contain"
                source={require('@/assets/images/welcome/logo.png')}
                style={styles.logo}
              />
              <ThemedText style={styles.brandName}>yoLingo</ThemedText>
            </View>
          </View>

          <View style={[styles.lesson, isDesktop && styles.desktopLesson]}>
            <View style={[styles.introduction, isDesktop && styles.desktopIntroduction]}>
              <ThemedText themeColor="decorationPurple" style={styles.eyebrow}>
                HIRAGANA · PRIMERA LECCIÓN
              </ThemedText>
              <ThemedText
                accessibilityRole="header"
                style={[styles.title, isDesktop && styles.desktopTitle]}>
                Conoce {hiraganaA.symbol}
              </ThemedText>
              <ThemedText
                themeColor="textSecondary"
                style={[styles.description, isDesktop && styles.desktopDescription]}>
                {hiraganaA.symbol} representa el sonido «{hiraganaA.reading}», como en «casa». Es la
                primera vocal que aprenderás a reconocer y escribir.
              </ThemedText>
            </View>

            <ThemedView type="backgroundElement" style={styles.characterCard}>
              <View style={styles.cardHeading}>
                <ThemedText accessibilityRole="header" style={styles.cardTitle}>
                  {isPracticeStarted ? 'Tu turno' : `${hiraganaA.strokes.length} trazos`}
                </ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.hint}>
                  {isPracticeStarted
                    ? 'Recuerda el orden: horizontal, vertical y trazo curvo.'
                    : 'Observa el orden y la dirección de cada trazo.'}
                </ThemedText>
              </View>

              <KanaStrokeDemo
                character={hiraganaA}
                replayKey={replayKey}
                showComplete={isPracticeStarted}
              />

              <View style={styles.actions}>
                <Pressable
                  accessibilityRole="button"
                  onBlur={() => setFocusedButton(null)}
                  onFocus={() => setFocusedButton('replay')}
                  onPress={() => {
                    setIsPracticeStarted(false);
                    setReplayKey((current) => current + 1);
                  }}
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    { borderColor: theme.accent, backgroundColor: pressed ? theme.backgroundSelected : 'transparent' },
                    Platform.OS === 'web' && focusedButton === 'replay' && {
                      outlineColor: theme.focusRing,
                      outlineStyle: 'solid',
                      outlineWidth: 3,
                      outlineOffset: 2,
                    },
                  ]}>
                  <ThemedText style={styles.secondaryButtonLabel}>REPRODUCIR DE NUEVO</ThemedText>
                </Pressable>

                <View style={[styles.primaryShadow, { backgroundColor: theme.accentShadow }]}>
                  <Pressable
                    accessibilityRole="button"
                    onBlur={() => setFocusedButton(null)}
                    onFocus={() => setFocusedButton('practice')}
                    onPress={() => setIsPracticeStarted(true)}
                    style={({ pressed }) => [
                      styles.primaryButton,
                      { backgroundColor: pressed ? theme.accentPressed : theme.accent },
                      pressed && styles.primaryButtonPressed,
                      Platform.OS === 'web' && focusedButton === 'practice' && {
                        outlineColor: theme.focusRing,
                        outlineStyle: 'solid',
                        outlineWidth: 3,
                        outlineOffset: 2,
                      },
                    ]}>
                    <ThemedText style={[styles.primaryButtonLabel, { color: theme.accentText }]}>
                      {isPracticeStarted ? 'PRÁCTICA LISTA' : 'COMENZAR PRÁCTICA'}
                    </ThemedText>
                  </Pressable>
                </View>
              </View>

              <ThemedText accessibilityLiveRegion="polite" role="status" style={styles.status}>
                {isPracticeStarted ? 'Práctica preparada. Empieza por el trazo horizontal.' : ''}
              </ThemedText>
              <ExternalLink href={hiraganaA.source.url}>
                <ThemedText themeColor="textSecondary" style={styles.attribution}>
                  Trazos: {hiraganaA.source.name} · {hiraganaA.source.license} ↗
                </ThemedText>
              </ExternalLink>
            </ThemedView>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center' },
  safeArea: { flex: 1, width: '100%', maxWidth: 1280 },
  content: { flexGrow: 1, padding: Spacing.four },
  topBar: { width: '100%', alignItems: 'center', gap: Spacing.three },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 50, aspectRatio: 62 / 53 },
  brandName: { fontSize: 40, lineHeight: 46, fontWeight: 800 },
  lesson: {
    flexGrow: 1,
    alignItems: 'center',
    gap: Spacing.five,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.four,
  },
  introduction: { width: '100%', maxWidth: 540, alignItems: 'center', gap: Spacing.three },
  eyebrow: { fontSize: 14, lineHeight: 20, fontWeight: 800, letterSpacing: 1.2 },
  title: { textAlign: 'center', fontSize: 40, lineHeight: 48, fontWeight: 800 },
  description: { textAlign: 'center', fontSize: 17, lineHeight: 26 },
  characterCard: {
    width: '100%',
    maxWidth: 480,
    minHeight: 360,
    borderRadius: 32,
    padding: Spacing.five,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
  },
  cardHeading: { alignItems: 'center', gap: Spacing.two },
  cardTitle: { fontSize: 28, lineHeight: 36, fontWeight: 800 },
  hint: { maxWidth: 320, textAlign: 'center', fontSize: 16, lineHeight: 24 },
  actions: { width: '100%', gap: Spacing.three },
  secondaryButton: {
    minHeight: 52,
    borderWidth: 2,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  secondaryButtonLabel: { fontSize: 14, lineHeight: 20, fontWeight: 800, textAlign: 'center' },
  primaryShadow: { width: '100%', paddingBottom: 7, borderRadius: 20 },
  primaryButton: {
    minHeight: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  primaryButtonPressed: { transform: [{ translateY: 4 }] },
  primaryButtonLabel: { fontSize: 16, lineHeight: 22, fontWeight: 800, textAlign: 'center' },
  status: { minHeight: 24, textAlign: 'center' },
  attribution: { fontSize: 13, lineHeight: 20, textDecorationLine: 'underline' },
  desktopContent: {
    paddingHorizontal: Spacing.six,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.six,
  },
  desktopTopBar: { flexDirection: 'row' },
  desktopBackButton: { alignSelf: 'center' },
  desktopLesson: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.six,
    paddingVertical: Spacing.six,
  },
  desktopIntroduction: { flex: 1, alignItems: 'flex-start', gap: Spacing.four },
  desktopTitle: { textAlign: 'left', fontSize: 52, lineHeight: 60 },
  desktopDescription: { textAlign: 'left', fontSize: 19, lineHeight: 29 },
});
