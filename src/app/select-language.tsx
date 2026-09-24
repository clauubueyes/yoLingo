import { Image } from 'expo-image';
import { Platform, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { languages } from '@/constants/languages';
import { Spacing } from '@/constants/theme';

export default function SelectLanguageScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 900;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          alwaysBounceVertical={false}
          contentContainerStyle={[styles.content, isDesktop && styles.desktopContent]}>
          <View style={[styles.brand, isDesktop && styles.desktopBrand]}>
            <Image
              accessible={false}
              contentFit="contain"
              source={require('@/assets/images/welcome/logo.png')}
              style={styles.logo}
            />
            <ThemedText style={styles.brandName}>yoLingo</ThemedText>
          </View>
          <View style={[styles.main, isDesktop && styles.desktopMain]}>
            <View style={[styles.introduction, isDesktop && styles.desktopIntroduction]}>
              <ThemedText
                accessibilityRole="header"
                style={[styles.title, isDesktop && styles.desktopTitle]}>
                Selecciona tu idioma
              </ThemedText>

              <ThemedText
                themeColor="textSecondary"
                style={[styles.description, isDesktop && styles.desktopDescription]}>
                Elige el idioma que quieres aprender
              </ThemedText>
            </View>

            <View style={[styles.options, isDesktop && styles.desktopOptions]}>
              {languages.map((language) => (
                <ThemedView key={language.id} type="backgroundElement" style={styles.card}>
                  <ThemedView
                    accessibilityElementsHidden
                    aria-hidden
                    importantForAccessibility="no-hide-descendants"
                    type="backgroundSelected"
                    style={styles.decoration}>
                    <ThemedText themeColor="decorationPurple" style={styles.character}>
                      あ
                    </ThemedText>
                  </ThemedView>
                  <View style={styles.languageNames}>
                    <ThemedText accessibilityRole="header" style={styles.languageName}>
                      {language.name}
                    </ThemedText>
                    <ThemedText themeColor="textSecondary" style={styles.nativeName}>
                      {language.nativeName}
                    </ThemedText>
                  </View>
                  <ThemedText themeColor="textSecondary" style={styles.cardDescription}>
                    {language.description}
                  </ThemedText>
                </ThemedView>
              ))}
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
  main: {
    alignItems: 'center',
    gap: Spacing.five,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.four,
  },
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
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 10,
  },
  logo: { width: 50, aspectRatio: 62 / 53 },
  brandName: { fontSize: 40, lineHeight: 46, fontWeight: 800 },
  introduction: { width: '100%', maxWidth: 540, gap: Spacing.three },
  options: { width: '100%', maxWidth: 480, gap: Spacing.four },
  card: { borderRadius: 32, padding: Spacing.five, gap: Spacing.four },
  decoration: {
    width: 96,
    height: 96,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  character: { fontSize: 56, lineHeight: 72, fontWeight: 800 },
  languageNames: { gap: Spacing.two },
  languageName: { fontSize: 32, lineHeight: 40, fontWeight: 800 },
  nativeName: { fontSize: 20, lineHeight: 28 },
  cardDescription: { fontSize: 17, lineHeight: 25 },
  desktopContent: {
    paddingHorizontal: Spacing.six,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.six,
  },
  desktopBrand: { alignSelf: 'flex-start' },
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
