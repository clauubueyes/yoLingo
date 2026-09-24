import { Image } from 'expo-image';
import { Platform, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton } from '@/components/back-button';
import { ExternalLink } from '@/components/external-link';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { hiraganaA } from '@/content/japanese/hiragana';
import { Spacing } from '@/constants/theme';

export default function HiraganaALessonScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 900;

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
              <ThemedText
                accessibilityLabel={`Hiragana ${hiraganaA.reading}`}
                style={styles.character}>
                {hiraganaA.symbol}
              </ThemedText>
              <ThemedView type="backgroundSelected" style={styles.readingBadge}>
                <ThemedText themeColor="decorationPurple" style={styles.reading}>
                  {hiraganaA.reading}
                </ThemedText>
              </ThemedView>
              <ThemedText themeColor="textSecondary" style={styles.hint}>
                Primero conocerás su forma. Después practicarás sus trazos.
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
  character: { fontSize: 150, lineHeight: 174, fontWeight: 700 },
  readingBadge: { minWidth: 72, padding: Spacing.two, borderRadius: 18, alignItems: 'center' },
  reading: { fontSize: 28, lineHeight: 36, fontWeight: 800 },
  hint: { maxWidth: 320, textAlign: 'center', fontSize: 16, lineHeight: 24 },
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
