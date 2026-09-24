import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const LOGO_ASPECT_RATIO = 62 / 53;
const MASCOT_ASPECT_RATIO = 307 / 246;

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width >= 900;
  const router = useRouter();
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const mascotScene = (
    <View style={[styles.mascotScene, isDesktop && webStyles.mascotScene]}>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[styles.speechBubble, styles.hiBubble]}>
        <ThemedText style={[styles.bubbleText, { color: theme.decorationPurple }]}>
          Hi!
        </ThemedText>
      </View>

      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[styles.speechBubble, styles.kanaBubble]}>
        <ThemedText style={[styles.kanaText, { color: theme.decorationPurple }]}>
          あ
        </ThemedText>
      </View>

      <View
        style={[
          styles.decorationDot,
          styles.orangeDot,
          { backgroundColor: theme.decorationOrange },
        ]}
      />
      <View
        style={[
          styles.decorationDot,
          styles.purpleDot,
          { backgroundColor: theme.decorationPurple },
        ]}
      />
      <View
        style={[
          styles.decorationDot,
          styles.yellowDot,
          { backgroundColor: theme.decorationYellow },
        ]}
      />
      <View
        style={[
          styles.decorationDot,
          styles.smallYellowDot,
          { backgroundColor: theme.decorationYellow },
        ]}
      />
      <View
        style={[
          styles.decorationDot,
          styles.mintDot,
          { backgroundColor: theme.decorationMint },
        ]}
      />

      <Image
        accessibilityLabel="Mascota de yoLingo"
        contentFit="contain"
        source={require('@/assets/images/welcome/mascot.png')}
        style={[styles.mascot, isDesktop && webStyles.mascot]}
      />
    </View>
  );

  const introduction = (
    <View style={[styles.introduction, isDesktop && webStyles.introduction]}>
      <ThemedText style={[styles.headline, isDesktop && webStyles.headline]}>
        Aprende idiomas{`\n`}a tu manera
      </ThemedText>
      <ThemedText
        themeColor="textSecondary"
        style={[styles.description, isDesktop && webStyles.description]}>
        Explora, practica y guarda las palabras{`\n`}que quieres recordar. A tu ritmo.
      </ThemedText>
    </View>
  );

  const footer = (
    <View style={[styles.footer, isDesktop && webStyles.footer]}>
      <View
        style={[
          styles.ctaShadow,
          { backgroundColor: theme.accentShadow },
        ]}>
        <Pressable
          accessibilityRole="button"
          onBlur={() => setIsFocused(false)}
          onFocus={() => setIsFocused(true)}
          onHoverIn={() => setIsHovered(true)}
          onHoverOut={() => setIsHovered(false)}
          onPress={() => router.push('/select-language')}
          style={({ pressed }) => {
            const backgroundColor = pressed
              ? theme.accentPressed
              : isHovered
                ? theme.accentHover
                : theme.accent;

            return [
              styles.cta,
              {
                backgroundColor,
                borderColor: isFocused ? theme.focusRing : backgroundColor,
              },
              pressed && styles.ctaPressed,
            ];
          }}>
          <ThemedText style={[styles.ctaLabel, { color: theme.accentText }]}>
            EMPEZAR
          </ThemedText>
        </Pressable>
      </View>

      <ThemedText themeColor="textSecondary" style={styles.footerNote}>
        Gratis para empezar · A tu manera
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={[styles.safeArea, isWeb && webStyles.safeArea]}>
        <ScrollView
          alwaysBounceVertical={false}
          contentContainerStyle={[
            styles.scrollContent,
            isWeb && webStyles.scrollContent,
            isDesktop && webStyles.desktopContent,
          ]}
          showsVerticalScrollIndicator={false}>
          <View style={[styles.brand, isDesktop && webStyles.brand]}>
            <Image
              accessible={false}
              contentFit="contain"
              source={require('@/assets/images/welcome/logo.png')}
              style={styles.logo}
            />
            <ThemedText style={styles.brandName}>yoLingo</ThemedText>
          </View>

          {isDesktop ? (
            <View style={webStyles.hero}>
              <View style={webStyles.copyColumn}>
                {introduction}
                {footer}
              </View>
              {mascotScene}
            </View>
          ) : (
            <>
              <View style={styles.mainContent}>
                {mascotScene}
                {introduction}
              </View>
              {footer}
            </>
          )}
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
    maxWidth: MaxContentWidth,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: Platform.select({ web: 84, default: Spacing.three }),
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
  },
  brand: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  logo: {
    width: 50,
    aspectRatio: LOGO_ASPECT_RATIO,
  },
  brandName: {
    fontSize: 40,
    fontWeight: 800,
    lineHeight: 46,
  },
  mainContent: {
    alignItems: 'center',
    marginTop: Spacing.four,
  },
  mascotScene: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
    maxWidth: 360,
    height: 282,
  },
  mascot: {
    width: '86%',
    maxWidth: 307,
    aspectRatio: MASCOT_ASPECT_RATIO,
  },
  speechBubble: {
    position: 'absolute',
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
  },
  hiBubble: {
    left: 6,
    top: 48,
    width: 92,
    height: 64,
  },
  kanaBubble: {
    right: 4,
    bottom: 8,
    width: 78,
    height: 66,
  },
  bubbleText: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: 800,
  },
  kanaText: {
    fontSize: 40,
    lineHeight: 48,
    fontWeight: 800,
  },
  decorationDot: {
    position: 'absolute',
    zIndex: 2,
    borderRadius: 999,
  },
  orangeDot: {
    left: 18,
    top: 4,
    width: 16,
    height: 16,
  },
  purpleDot: {
    right: 10,
    top: 52,
    width: 18,
    height: 18,
  },
  yellowDot: {
    right: 48,
    top: 104,
    width: 15,
    height: 15,
  },
  smallYellowDot: {
    right: 34,
    top: 123,
    width: 7,
    height: 7,
  },
  mintDot: {
    left: 0,
    bottom: 62,
    width: 12,
    height: 12,
  },
  introduction: {
    alignItems: 'center',
    marginTop: Spacing.four,
    gap: Spacing.three,
  },
  headline: {
    textAlign: 'center',
    fontSize: 36,
    lineHeight: 42,
    fontWeight: 800,
  },
  description: {
    textAlign: 'center',
    fontSize: 17,
    lineHeight: 25,
    fontWeight: 500,
  },
  footer: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 584,
    alignSelf: 'center',
    marginTop: 'auto',
    paddingTop: 48,
  },
  ctaShadow: {
    width: '100%',
    paddingBottom: 8,
    borderRadius: 24,
  },
  cta: {
    minHeight: 64,
    paddingHorizontal: Spacing.four,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  ctaPressed: {
    transform: [{ translateY: 4 }],
  },
  ctaLabel: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: 800,
  },
  footerNote: {
    marginTop: Spacing.three,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 500,
  },
});

const webStyles = StyleSheet.create({
  safeArea: {
    maxWidth: 1280,
  },
  scrollContent: {
    paddingTop: Spacing.four,
  },
  desktopContent: {
    paddingHorizontal: Spacing.six,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.six,
  },
  brand: {
    alignSelf: 'flex-start',
  },
  hero: {
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.five,
    paddingVertical: Spacing.six,
  },
  copyColumn: {
    flex: 1,
    maxWidth: 540,
  },
  introduction: {
    alignItems: 'flex-start',
    marginTop: 0,
    gap: Spacing.four,
  },
  headline: {
    textAlign: 'left',
    fontSize: 48,
    lineHeight: 56,
  },
  description: {
    textAlign: 'left',
    fontSize: 19,
    lineHeight: 29,
  },
  footer: {
    alignSelf: 'flex-start',
    maxWidth: 360,
    marginTop: 0,
    paddingTop: Spacing.five,
  },
  mascotScene: {
    flex: 1,
    maxWidth: 480,
    height: 390,
  },
  mascot: {
    maxWidth: 430,
  },
});
