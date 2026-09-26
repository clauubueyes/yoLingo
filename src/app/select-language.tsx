import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton } from '@/components/back-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { languages } from '@/constants/languages';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type LanguageId = (typeof languages)[number]['id'];

export default function SelectLanguageScreen() {
  const { height, width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 900;
  const isNarrow = width < 480;
  const isShort = isNarrow && height < 700;
  const router = useRouter();
  const theme = useTheme();
  const [selectedId, setSelectedId] = useState<LanguageId | null>(null);
  const [focusedId, setFocusedId] = useState<LanguageId | null>(null);
  const [isContinueFocused, setIsContinueFocused] = useState(false);
  const [isContinueHovered, setIsContinueHovered] = useState(false);
  const canContinue = selectedId === 'ja';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          alwaysBounceVertical={false}
          contentContainerStyle={[
            styles.content,
            isNarrow && styles.narrowContent,
            isDesktop && styles.desktopContent,
          ]}>
          <View style={[styles.topBar, isNarrow && styles.narrowTopBar, isDesktop && styles.desktopTopBar]}>
            <BackButton
              accessibilityLabel="Volver a la bienvenida"
              fallbackHref="/"
              style={isDesktop && styles.desktopBackButton}
            />

            <View style={[styles.brand, isNarrow && styles.narrowBrand, isDesktop && styles.desktopBrand]}>
              <Image
                accessible={false}
                contentFit="contain"
                source={require('@/assets/images/welcome/logo.png')}
                style={[styles.logo, isNarrow && styles.narrowLogo]}
              />
              <ThemedText style={[styles.brandName, isNarrow && styles.narrowBrandName]}>yoLingo</ThemedText>
            </View>
          </View>
          <View style={[styles.main, isNarrow && styles.narrowMain, isDesktop && styles.desktopMain]}>
            <View style={[styles.introduction, isNarrow && styles.narrowIntroduction, isDesktop && styles.desktopIntroduction]}>
              <ThemedText
                accessibilityRole="header"
                style={[styles.title, isNarrow && styles.narrowTitle, isDesktop && styles.desktopTitle]}>
                Selecciona tu idioma
              </ThemedText>

              <ThemedText
                themeColor="textSecondary"
                style={[styles.description, isNarrow && styles.narrowDescription, isShort && styles.shortDescription, isDesktop && styles.desktopDescription]}>
                Elige el idioma que quieres aprender
              </ThemedText>
            </View>

            <View style={[styles.options, isNarrow && styles.narrowOptions, isDesktop && styles.desktopOptions]}>
              {languages.map((language) => (
                <Pressable
                  key={language.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${language.name}, ${language.nativeName}. ${language.description}`}
                  accessibilityState={{ selected: selectedId === language.id }}
                  aria-pressed={selectedId === language.id}
                  onPress={() => setSelectedId(language.id)}
                  onFocus={() => setFocusedId(language.id)}
                  onBlur={() => setFocusedId(null)}
                  style={({ pressed }) => [
                    styles.card,
                    isNarrow && styles.narrowCard,
                    {
                      backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement,
                      borderColor: selectedId === language.id ? theme.accent : 'transparent',
                    },
                    Platform.OS === 'web' && focusedId === language.id && {
                      outlineColor: theme.focusRing,
                      outlineStyle: 'solid',
                      outlineWidth: 3,
                      outlineOffset: 4,
                    },
                  ]}>
                  <ThemedView
                    accessibilityElementsHidden
                    aria-hidden
                    importantForAccessibility="no-hide-descendants"
                    type="backgroundSelected"
                    style={[styles.decoration, isNarrow && styles.narrowDecoration]}>
                    <ThemedText themeColor="decorationPurple" style={[styles.character, isNarrow && styles.narrowCharacter]}>
                      あ
                    </ThemedText>
                  </ThemedView>
                  <View style={[styles.languageDetails, isNarrow && styles.narrowLanguageDetails]}>
                  <View style={[styles.languageNames, isNarrow && styles.narrowLanguageNames]}>
                    <ThemedText style={[styles.languageName, isNarrow && styles.narrowLanguageName]}>
                      {language.name}
                    </ThemedText>
                    <ThemedText themeColor="textSecondary" style={[styles.nativeName, isNarrow && styles.narrowNativeName]}>
                      {language.nativeName}
                    </ThemedText>
                  </View>
                  <ThemedText themeColor="textSecondary" style={[styles.cardDescription, isNarrow && styles.narrowCardDescription]}>
                    {language.description}
                  </ThemedText>
                  </View>
                  {selectedId === language.id && (
                    <View
                      accessibilityElementsHidden
                      aria-hidden
                      importantForAccessibility="no-hide-descendants"
                      style={[styles.selectionIndicator, isNarrow && styles.narrowSelectionIndicator, { backgroundColor: theme.accent }]}>
                      <ThemedText style={[styles.checkmark, { color: theme.accentText }]}>
                        ✓
                      </ThemedText>
                    </View>
                  )}
                </Pressable>
              ))}
              <ThemedText accessibilityLiveRegion="polite" role="status" style={[styles.selectionStatus, isNarrow && styles.narrowSelectionStatus]}>
                {selectedId !== null
                  ? `${languages.find((language) => language.id === selectedId)?.name} seleccionado`
                  : ''}
              </ThemedText>

              <View
                style={[
                  styles.continueShadow,
                  isNarrow && styles.narrowContinueShadow,
                  {
                    backgroundColor: canContinue
                      ? theme.accentShadow
                      : theme.backgroundSelected,
                  },
                ]}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !canContinue }}
                  disabled={!canContinue}
                  onBlur={() => setIsContinueFocused(false)}
                  onFocus={() => setIsContinueFocused(true)}
                  onHoverIn={() => setIsContinueHovered(true)}
                  onHoverOut={() => setIsContinueHovered(false)}
                  onPress={() => router.push('/learn/japanese/hiragana/a')}
                  style={({ pressed }) => [
                    styles.continueButton,
                    isNarrow && styles.narrowContinueButton,
                    {
                      backgroundColor: !canContinue
                        ? theme.backgroundSelected
                        : pressed
                          ? theme.accentPressed
                          : isContinueHovered
                            ? theme.accentHover
                            : theme.accent,
                      borderColor: isContinueFocused ? theme.focusRing : 'transparent',
                    },
                    pressed && styles.continuePressed,
                  ]}>
                  <ThemedText
                    style={[
                      styles.continueLabel,
                      { color: canContinue ? theme.accentText : theme.textSecondary },
                    ]}>
                    CONTINUAR
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: 1280,
  },
  content: {
    flexGrow: 1,
    padding: Spacing.four,
  },
  narrowContent: { padding: 16 },
  main: {
    alignItems: 'center',
    gap: Spacing.five,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.four,
  },
  narrowMain: { gap: 20, paddingTop: 24, paddingBottom: 16 },
  topBar: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.three,
  },
  narrowTopBar: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.two },
  title: {
    fontSize: 36,
    lineHeight: 42,
    fontWeight: 800,
    textAlign: 'center',
  },
  description: {
    fontSize: 17,
    lineHeight: 25,
    textAlign: 'center',
  },
  narrowDescription: { fontSize: 15, lineHeight: 21 },
  shortDescription: { fontSize: 14, lineHeight: 20 },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 10,
  },
  narrowBrand: { alignSelf: 'auto', gap: 8 },
  logo: { width: 50, aspectRatio: 62 / 53 },
  narrowLogo: { width: 34 },
  brandName: { fontSize: 40, lineHeight: 46, fontWeight: 800 },
  narrowBrandName: { fontSize: 28, lineHeight: 34 },
  introduction: { width: '100%', maxWidth: 540, gap: Spacing.three },
  narrowIntroduction: { gap: Spacing.two },
  narrowTitle: { fontSize: 28, lineHeight: 34 },
  options: { width: '100%', maxWidth: 480, gap: Spacing.four },
  narrowOptions: { gap: 12 },
  card: { borderRadius: 32, borderWidth: 3, padding: Spacing.five - 3, gap: Spacing.four },
  narrowCard: { minHeight: 116, flexDirection: 'row', alignItems: 'center', borderRadius: 20, borderWidth: 2, padding: 14, paddingRight: 46, gap: 14 },
  selectionIndicator: {
    position: 'absolute',
    top: Spacing.four,
    right: Spacing.four,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  narrowSelectionIndicator: { top: 12, right: 12, width: 26, height: 26, borderRadius: 13 },
  checkmark: { fontSize: 20, lineHeight: 26, fontWeight: 800 },
  selectionStatus: { minHeight: 24, textAlign: 'center' },
  narrowSelectionStatus: { minHeight: 20, fontSize: 14, lineHeight: 20 },
  continueShadow: { width: '100%', paddingBottom: 8, borderRadius: 24 },
  narrowContinueShadow: { paddingBottom: 6, borderRadius: 18 },
  continueButton: {
    minHeight: 64,
    borderWidth: 3,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  narrowContinueButton: { minHeight: 52, borderWidth: 2, borderRadius: 18 },
  continuePressed: { transform: [{ translateY: 4 }] },
  continueLabel: { fontSize: 18, lineHeight: 24, fontWeight: 800 },
  decoration: {
    width: 96,
    height: 96,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  narrowDecoration: { width: 64, height: 64, borderRadius: 18 },
  character: { fontSize: 56, lineHeight: 72, fontWeight: 800 },
  narrowCharacter: { fontSize: 40, lineHeight: 50 },
  languageDetails: { gap: Spacing.four },
  narrowLanguageDetails: { flex: 1, gap: 6 },
  languageNames: { gap: Spacing.two },
  narrowLanguageNames: { gap: 0 },
  languageName: { fontSize: 32, lineHeight: 40, fontWeight: 800 },
  narrowLanguageName: { fontSize: 22, lineHeight: 28 },
  nativeName: { fontSize: 20, lineHeight: 28 },
  narrowNativeName: { fontSize: 16, lineHeight: 22 },
  cardDescription: { fontSize: 17, lineHeight: 25 },
  narrowCardDescription: { fontSize: 14, lineHeight: 19 },
  desktopContent: {
    paddingHorizontal: Spacing.six,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.six,
  },
  desktopTopBar: { flexDirection: 'row' },
  desktopBackButton: { alignSelf: 'center' },
  desktopBrand: { alignSelf: 'center' },
  desktopMain: {
    flexGrow: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.six,
    paddingVertical: Spacing.six,
  },
  desktopIntroduction: { flex: 1, gap: Spacing.four },
  desktopTitle: { fontSize: 48, lineHeight: 56, textAlign: 'left' },
  desktopDescription: { fontSize: 19, lineHeight: 29, textAlign: 'left' },
  desktopOptions: { flex: 1 },
});
