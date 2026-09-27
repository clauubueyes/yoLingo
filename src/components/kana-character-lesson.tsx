import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton } from '@/components/back-button';
import { ExternalLink } from '@/components/external-link';
import { KanaLessonResult, KanaRecognitionQuiz } from '@/components/kana-lesson-completion';
import { KanaStrokeDemo } from '@/components/kana-stroke-demo';
import { KanaWritingCanvas } from '@/components/kana-writing-canvas';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { KanaCharacter } from '@/domain/kana';
import { useTheme } from '@/hooks/use-theme';

type LessonPhase = 'demonstration' | 'writing' | 'recognition' | 'result';

type KanaCharacterLessonProps = {
  character: KanaCharacter;
  onReturnToPath: () => void;
};

export function KanaCharacterLesson({ character, onReturnToPath }: KanaCharacterLessonProps) {
  const { height, width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 960;
  const isNarrow = width < 480;
  const isCompact = width < 480 || height < 800;
  const isShortMobile = isNarrow && height < 700;
  const isShortDesktop = isDesktop && height < 800;
  const theme = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const [replayKey, setReplayKey] = useState(0);
  const [phase, setPhase] = useState<LessonPhase>('demonstration');
  const [isDrawing, setIsDrawing] = useState(false);
  const [focusedButton, setFocusedButton] = useState<'replay' | 'practice' | null>(null);
  const phaseStep = phase === 'demonstration' ? 1 : phase === 'writing' ? 2 : 3;

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [phase]);

  const repeatLesson = () => {
    setReplayKey((current) => current + 1);
    setPhase('demonstration');
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          ref={scrollRef}
          alwaysBounceVertical={false}
          scrollEnabled={!isDrawing}
          contentContainerStyle={[
            styles.content,
            isCompact && styles.compactContent,
            isNarrow && styles.narrowContent,
            isDesktop && styles.desktopContent,
            isShortDesktop && styles.shortDesktopContent,
          ]}>
          <View
            style={[
              styles.topBar,
              isNarrow && styles.narrowTopBar,
              isDesktop && styles.desktopTopBar,
            ]}>
            <BackButton
              accessibilityLabel="Volver a seleccionar idioma"
              fallbackHref="/select-language"
              style={isDesktop && styles.desktopBackButton}
            />

            {isNarrow && phase !== 'result' && (
              <ThemedText themeColor="textSecondary" style={styles.mobileProgress}>
                Paso {phaseStep} de 3
              </ThemedText>
            )}

            <View style={[styles.brand, isNarrow && styles.mobileHidden]}>
              <Image
                accessible={false}
                contentFit="contain"
                source={require('@/assets/images/welcome/logo.png')}
                style={[styles.logo, isCompact && styles.compactLogo, isNarrow && styles.narrowLogo]}
              />
              <ThemedText
                style={[
                  styles.brandName,
                  isCompact && styles.compactBrandName,
                  isNarrow && styles.narrowBrandName,
                ]}>
                yoLingo
              </ThemedText>
            </View>
          </View>

          <View
            style={[
              styles.lesson,
              isCompact && styles.compactLesson,
              isNarrow && styles.narrowLesson,
              isDesktop && styles.desktopLesson,
              isShortDesktop && styles.shortDesktopLesson,
            ]}>
            {(isDesktop || (!isNarrow && phase === 'demonstration')) && (
              <View
                style={[
                  styles.introduction,
                  isNarrow && styles.narrowIntroduction,
                  isDesktop && styles.desktopIntroduction,
                ]}>
                <ThemedText
                  themeColor="decorationPurple"
                  style={[styles.eyebrow, isNarrow && styles.narrowEyebrow]}>
                  HIRAGANA · PRIMERA LECCIÓN
                </ThemedText>
                <ThemedText
                  accessibilityRole="header"
                  style={[
                    styles.title,
                    isCompact && styles.compactTitle,
                    isNarrow && styles.narrowTitle,
                    isDesktop && styles.desktopTitle,
                  ]}>
                  Conoce {character.symbol}
                </ThemedText>
                <ThemedText
                  themeColor="textSecondary"
                  style={[
                    styles.description,
                    isNarrow && styles.narrowDescription,
                    isShortMobile && styles.shortMobileDescription,
                    isDesktop && styles.desktopDescription,
                  ]}>
                  {character.introduction}
                </ThemedText>
              </View>
            )}

            <ThemedView
              type="backgroundElement"
              style={[
                styles.characterCard,
                isCompact && styles.compactCharacterCard,
                isNarrow && styles.narrowCharacterCard,
              ]}>
              <View style={[styles.stageContent, isNarrow && styles.narrowStageContent]}>
              {(phase === 'demonstration' || phase === 'writing') && (
                <View style={styles.cardHeading}>
                  <ThemedText
                    accessibilityRole="header"
                    style={[styles.cardTitle, isNarrow && styles.narrowCardTitle]}>
                    {phase === 'writing'
                      ? isNarrow
                        ? `Escribe ${character.symbol}`
                        : 'Tu turno'
                      : isNarrow
                        ? `Conoce ${character.symbol}`
                        : `${character.strokes.length} trazos`}
                  </ThemedText>
                  <ThemedText
                    themeColor="textSecondary"
                    style={[styles.hint, isNarrow && styles.narrowHint]}>
                    {phase === 'writing'
                      ? isNarrow
                        ? 'Sigue el orden de los tres trazos.'
                        : character.writingHint
                      : isNarrow
                        ? `Observa el orden y recuerda que se lee «${character.reading}».`
                        : 'Observa el orden y la dirección de cada trazo.'}
                  </ThemedText>
                </View>
              )}

              {phase === 'writing' && (
                <KanaWritingCanvas
                  character={character}
                  onComplete={() => setPhase('recognition')}
                  onDrawingChange={setIsDrawing}
                />
              )}
              {phase === 'demonstration' && (
                <KanaStrokeDemo character={character} replayKey={replayKey} />
              )}
              {phase === 'recognition' && (
                <KanaRecognitionQuiz
                  character={character}
                  onComplete={() => setPhase('result')}
                />
              )}
              {phase === 'result' && (
                <KanaLessonResult
                  character={character}
                  onRepeat={repeatLesson}
                  onReturnToPath={onReturnToPath}
                />
              )}

              {(phase === 'demonstration' || phase === 'writing') && (
                <View style={[styles.actions, isNarrow && styles.narrowActions]}>
                  {phase === 'demonstration' && (
                    <View
                      style={[
                        styles.primaryShadow,
                        { backgroundColor: theme.accentShadow },
                      ]}>
                      <Pressable
                        accessibilityRole="button"
                        onBlur={() => setFocusedButton(null)}
                        onFocus={() => setFocusedButton('practice')}
                        onPress={() => setPhase('writing')}
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
                          COMENZAR PRÁCTICA
                        </ThemedText>
                      </Pressable>
                    </View>
                  )}

                  <Pressable
                    accessibilityRole="button"
                    onBlur={() => setFocusedButton(null)}
                    onFocus={() => setFocusedButton('replay')}
                    onPress={() => {
                      setPhase('demonstration');
                      setReplayKey((current) => current + 1);
                    }}
                    style={({ pressed }) => [
                      styles.secondaryButton,
                      isNarrow && styles.narrowSecondaryButton,
                      {
                        borderColor: theme.accent,
                        backgroundColor: pressed ? theme.backgroundSelected : 'transparent',
                      },
                      Platform.OS === 'web' && focusedButton === 'replay' && {
                        outlineColor: theme.focusRing,
                        outlineStyle: 'solid',
                        outlineWidth: 3,
                        outlineOffset: 2,
                      },
                    ]}>
                    <ThemedText
                      style={[
                        styles.secondaryButtonLabel,
                        isNarrow && styles.narrowSecondaryButtonLabel,
                      ]}>
                      {phase === 'writing' ? 'VER DEMOSTRACIÓN' : 'REPRODUCIR DE NUEVO'}
                    </ThemedText>
                  </Pressable>
                </View>
              )}
              </View>
              <ExternalLink href={character.source.url} style={isNarrow && styles.narrowAttributionLink}>
                <ThemedText themeColor="textSecondary" style={styles.attribution}>
                  Trazos: {character.source.name} · {character.source.license} ↗
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
  compactContent: { padding: Spacing.three },
  narrowContent: { padding: 12 },
  topBar: { width: '100%', alignItems: 'center', gap: Spacing.three },
  narrowTopBar: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.two },
  mobileProgress: { fontSize: 13, lineHeight: 18, fontWeight: 700 },
  mobileHidden: { display: 'none' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 50, aspectRatio: 62 / 53 },
  compactLogo: { width: 42 },
  narrowLogo: { width: 34 },
  brandName: { fontSize: 40, lineHeight: 46, fontWeight: 800 },
  compactBrandName: { fontSize: 34, lineHeight: 40 },
  narrowBrandName: { fontSize: 28, lineHeight: 34 },
  lesson: {
    flexGrow: 1,
    alignItems: 'center',
    gap: Spacing.five,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.four,
  },
  compactLesson: { gap: Spacing.four, paddingTop: Spacing.four },
  narrowLesson: { gap: 0, paddingTop: 28, paddingBottom: 12 },
  introduction: { width: '100%', maxWidth: 540, alignItems: 'center', gap: Spacing.three },
  narrowIntroduction: { gap: Spacing.two },
  eyebrow: { fontSize: 14, lineHeight: 20, fontWeight: 800, letterSpacing: 1.2 },
  narrowEyebrow: { fontSize: 12, lineHeight: 17, letterSpacing: 1 },
  title: { textAlign: 'center', fontSize: 40, lineHeight: 48, fontWeight: 800 },
  compactTitle: { fontSize: 34, lineHeight: 41 },
  narrowTitle: { fontSize: 30, lineHeight: 36 },
  description: { textAlign: 'center', fontSize: 17, lineHeight: 26 },
  narrowDescription: { fontSize: 15, lineHeight: 22 },
  shortMobileDescription: { display: 'none' },
  characterCard: {
    width: '100%',
    maxWidth: 440,
    minHeight: 360,
    borderRadius: 32,
    padding: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
  },
  compactCharacterCard: { borderRadius: 26, padding: Spacing.three, gap: Spacing.three },
  narrowCharacterCard: {
    minHeight: 0,
    flexGrow: 1,
    justifyContent: 'flex-start',
    backgroundColor: 'transparent',
    borderRadius: 0,
    padding: 0,
    gap: 20,
  },
  stageContent: { width: '100%', alignItems: 'center', gap: Spacing.four },
  narrowStageContent: { flexGrow: 1, justifyContent: 'center', gap: 20 },
  cardHeading: { alignItems: 'center', gap: Spacing.two },
  cardTitle: { fontSize: 28, lineHeight: 36, fontWeight: 800 },
  narrowCardTitle: { fontSize: 22, lineHeight: 28 },
  hint: { maxWidth: 320, textAlign: 'center', fontSize: 16, lineHeight: 24 },
  narrowHint: { maxWidth: 280, fontSize: 15, lineHeight: 21 },
  actions: { width: '100%', gap: Spacing.three },
  narrowActions: { gap: Spacing.two },
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
  narrowSecondaryButton: { minHeight: 44, borderWidth: 0, borderRadius: 14 },
  narrowSecondaryButtonLabel: { fontSize: 13, lineHeight: 18 },
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
  attribution: { fontSize: 13, lineHeight: 20, textDecorationLine: 'underline' },
  narrowAttributionLink: { alignSelf: 'center' },
  desktopContent: {
    paddingHorizontal: 48,
    paddingTop: Spacing.four,
    paddingBottom: 48,
  },
  shortDesktopContent: { paddingTop: Spacing.three, paddingBottom: Spacing.three },
  desktopTopBar: { flexDirection: 'row' },
  desktopBackButton: { alignSelf: 'center' },
  desktopLesson: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 48,
    paddingVertical: 48,
  },
  shortDesktopLesson: { paddingVertical: Spacing.four },
  desktopIntroduction: { flex: 1, alignItems: 'flex-start', gap: Spacing.four },
  desktopTitle: { textAlign: 'left', fontSize: 46, lineHeight: 54 },
  desktopDescription: { textAlign: 'left', fontSize: 18, lineHeight: 27 },
});
