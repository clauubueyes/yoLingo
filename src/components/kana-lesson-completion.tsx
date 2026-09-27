import { useState } from 'react';
import { Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { KanaCharacter } from '@/domain/kana';
import { useTheme } from '@/hooks/use-theme';

const READING_OPTIONS = ['a', 'i', 'u', 'e'] as const;

type KanaRecognitionQuizProps = {
  character: KanaCharacter;
  onComplete: () => void;
};

export function KanaRecognitionQuiz({ character, onComplete }: KanaRecognitionQuizProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isNarrow = width < 480;
  const [selectedReading, setSelectedReading] = useState<string | null>(null);
  const [focusedReading, setFocusedReading] = useState<string | null>(null);
  const [isContinueFocused, setIsContinueFocused] = useState(false);
  const isCorrect = selectedReading === character.reading;

  return (
    <View style={[styles.step, isNarrow && styles.narrowStep]}>
      <ThemedText
        accessibilityLabel={`Hiragana ${character.reading}`}
        style={[styles.character, isNarrow && styles.narrowCharacter]}>
        {character.symbol}
      </ThemedText>
      <ThemedText
        accessibilityRole="header"
        style={[styles.question, isNarrow && styles.narrowQuestion]}>
        ¿Cómo se lee {character.symbol}?
      </ThemedText>

      <View accessibilityRole="radiogroup" style={styles.options}>
        {READING_OPTIONS.map((reading) => {
          const isSelected = selectedReading === reading;
          const isWrong = isSelected && !isCorrect;

          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected, disabled: isCorrect }}
              aria-checked={isSelected}
              disabled={isCorrect}
              key={reading}
              onBlur={() => setFocusedReading(null)}
              onFocus={() => setFocusedReading(reading)}
              onPress={() => setSelectedReading(reading)}
              style={({ pressed }) => [
                styles.option,
                {
                  backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement,
                  borderColor: isSelected
                    ? isWrong
                      ? theme.decorationOrange
                      : theme.accent
                    : theme.backgroundSelected,
                },
                Platform.OS === 'web' && focusedReading === reading && {
                  outlineColor: theme.focusRing,
                  outlineStyle: 'solid',
                  outlineWidth: 3,
                  outlineOffset: 2,
                },
              ]}>
              <ThemedText style={styles.optionLabel}>{reading.toUpperCase()}</ThemedText>
            </Pressable>
          );
        })}
      </View>

      <ThemedText
        accessibilityLiveRegion="assertive"
        role="status"
        style={[
          styles.feedback,
          selectedReading && {
            color: isCorrect ? theme.decorationMint : theme.decorationOrange,
          },
        ]}>
        {selectedReading
          ? isCorrect
            ? `¡Correcto! ${character.symbol} se lee «${character.reading}».`
            : 'Todavía no. Prueba otra respuesta.'
          : ''}
      </ThemedText>

      {isCorrect && (
        <View style={[styles.primaryShadow, { backgroundColor: theme.accentShadow }]}>
          <Pressable
            accessibilityRole="button"
            onBlur={() => setIsContinueFocused(false)}
            onFocus={() => setIsContinueFocused(true)}
            onPress={onComplete}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: pressed ? theme.accentPressed : theme.accent },
              pressed && styles.primaryPressed,
              Platform.OS === 'web' && isContinueFocused && {
                outlineColor: theme.focusRing,
                outlineStyle: 'solid',
                outlineWidth: 3,
                outlineOffset: 2,
              },
            ]}>
            <ThemedText style={[styles.primaryLabel, { color: theme.accentText }]}>
              VER RESULTADO
            </ThemedText>
          </Pressable>
        </View>
      )}
    </View>
  );
}

type KanaLessonResultProps = {
  character: KanaCharacter;
  onRepeat: () => void;
  onReturnToPath: () => void;
};

export function KanaLessonResult({
  character,
  onRepeat,
  onReturnToPath,
}: KanaLessonResultProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isNarrow = width < 480;
  const [focusedButton, setFocusedButton] = useState<'path' | 'repeat' | null>(null);

  return (
    <View style={[styles.step, isNarrow && styles.narrowStep]}>
      <ThemedView
        type="backgroundSelected"
        style={[styles.resultCharacterBadge, isNarrow && styles.narrowResultCharacterBadge]}>
        <ThemedText
          accessibilityLabel={`Hiragana ${character.reading}`}
          style={[styles.resultCharacter, isNarrow && styles.narrowResultCharacter]}>
          {character.symbol}
        </ThemedText>
      </ThemedView>
      <ThemedText
        accessibilityRole="header"
        style={[styles.resultTitle, isNarrow && styles.narrowResultTitle]}>
        Lección completada
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.resultDescription}>
        Ya has dado tus primeros pasos con Hiragana.
      </ThemedText>

      <View style={styles.resultList}>
        <ResultRow
          label={`Has escrito ${character.symbol} siguiendo sus ${character.strokes.length} trazos`}
        />
        <ResultRow label={`Has reconocido que ${character.symbol} se lee «${character.reading}»`} />
      </View>

      <View style={styles.resultActions}>
        <View style={[styles.primaryShadow, { backgroundColor: theme.accentShadow }]}>
          <Pressable
            accessibilityRole="button"
            onBlur={() => setFocusedButton(null)}
            onFocus={() => setFocusedButton('repeat')}
            onPress={onRepeat}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: pressed ? theme.accentPressed : theme.accent },
              pressed && styles.primaryPressed,
              Platform.OS === 'web' && focusedButton === 'repeat' && {
                outlineColor: theme.focusRing,
                outlineStyle: 'solid',
                outlineWidth: 3,
                outlineOffset: 2,
              },
            ]}>
            <ThemedText style={[styles.primaryLabel, { color: theme.accentText }]}>
              REPETIR LECCIÓN
            </ThemedText>
          </Pressable>
        </View>
        <Pressable
          accessibilityRole="button"
          onBlur={() => setFocusedButton(null)}
          onFocus={() => setFocusedButton('path')}
          onPress={onReturnToPath}
          style={({ pressed }) => [
            styles.secondaryButton,
            {
              backgroundColor: pressed ? theme.backgroundSelected : 'transparent',
              borderColor: theme.accent,
            },
            Platform.OS === 'web' && focusedButton === 'path' && {
              outlineColor: theme.focusRing,
              outlineStyle: 'solid',
              outlineWidth: 3,
              outlineOffset: 2,
            },
          ]}>
          <ThemedText style={styles.secondaryLabel}>VOLVER A LA RUTA</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

function ResultRow({ label }: { label: string }) {
  return (
    <View style={styles.resultRow}>
      <ThemedView type="backgroundSelected" style={styles.checkBadge}>
        <ThemedText themeColor="decorationMint" style={styles.checkmark}>
          ✓
        </ThemedText>
      </ThemedView>
      <ThemedText style={styles.resultLabel}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  step: { width: '100%', alignItems: 'center', gap: Spacing.four },
  narrowStep: { gap: Spacing.three },
  character: { fontSize: 88, lineHeight: 102, fontWeight: 700 },
  narrowCharacter: { fontSize: 72, lineHeight: 84 },
  question: { fontSize: 24, lineHeight: 31, fontWeight: 800, textAlign: 'center' },
  narrowQuestion: { fontSize: 22, lineHeight: 28 },
  options: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three },
  option: {
    width: '47%',
    flexGrow: 1,
    minHeight: 56,
    borderWidth: 3,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  optionLabel: { fontSize: 20, lineHeight: 26, fontWeight: 800 },
  feedback: { minHeight: 24, textAlign: 'center', fontSize: 16, lineHeight: 24, fontWeight: 700 },
  primaryShadow: { width: '100%', paddingBottom: 7, borderRadius: 20 },
  primaryButton: {
    minHeight: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  primaryPressed: { transform: [{ translateY: 4 }] },
  primaryLabel: { fontSize: 16, lineHeight: 22, fontWeight: 800, textAlign: 'center' },
  resultCharacterBadge: {
    width: 88,
    height: 88,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultCharacter: { fontSize: 54, lineHeight: 68, fontWeight: 700 },
  narrowResultCharacterBadge: { width: 72, height: 72, borderRadius: 22 },
  narrowResultCharacter: { fontSize: 46, lineHeight: 58 },
  resultTitle: { fontSize: 28, lineHeight: 35, fontWeight: 800, textAlign: 'center' },
  narrowResultTitle: { fontSize: 24, lineHeight: 31 },
  resultDescription: { fontSize: 16, lineHeight: 24, textAlign: 'center' },
  resultList: { width: '100%', gap: Spacing.three },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  checkBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: { fontSize: 22, lineHeight: 28, fontWeight: 800 },
  resultLabel: { flex: 1, fontSize: 16, lineHeight: 23 },
  resultActions: { width: '100%', gap: Spacing.three },
  secondaryButton: {
    minHeight: 52,
    borderWidth: 2,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  secondaryLabel: { fontSize: 14, lineHeight: 20, fontWeight: 800, textAlign: 'center' },
});
