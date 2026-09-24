import { useCallback, useMemo, useReducer, useState } from 'react';
import {
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type GestureResponderEvent,
  type LayoutChangeEvent,
  type ViewStyle,
} from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { KanaCharacter, StrokePoint } from '@/domain/kana';
import { getStrokeFeedback, validateKanaStroke } from '@/domain/kana-validation';
import { useTheme } from '@/hooks/use-theme';

const webCanvasStyle = { cursor: 'pointer', touchAction: 'none' } satisfies ViewStyle;

type CanvasSize = { width: number; height: number };
type DrawingState = {
  acceptedStrokes: readonly (readonly StrokePoint[])[];
  attempts: readonly (readonly StrokePoint[])[];
  currentPoints: readonly StrokePoint[];
  currentStrokeIndex: number;
  feedback: Readonly<{ message: string; tone: 'success' | 'error' }> | null;
  isComplete: boolean;
};
type DrawingAction =
  | { type: 'start'; point: StrokePoint }
  | { type: 'move'; point: StrokePoint }
  | { type: 'finish'; character: KanaCharacter }
  | { type: 'cancel' }
  | { type: 'undo' }
  | { type: 'reset' };

const initialDrawingState: DrawingState = {
  acceptedStrokes: [],
  attempts: [],
  currentPoints: [],
  currentStrokeIndex: 0,
  feedback: null,
  isComplete: false,
};

function drawingReducer(state: DrawingState, action: DrawingAction): DrawingState {
  switch (action.type) {
    case 'start':
      return { ...state, currentPoints: [action.point], feedback: null };
    case 'move':
      return { ...state, currentPoints: [...state.currentPoints, action.point] };
    case 'finish': {
      const result = validateKanaStroke(
        action.character,
        state.currentStrokeIndex,
        state.currentPoints,
      );
      if (!result.isValid) {
        return {
          ...state,
          attempts:
            state.currentPoints.length > 1
              ? [...state.attempts, state.currentPoints]
              : state.attempts,
          currentPoints: [],
          feedback: { message: getStrokeFeedback(result.reason), tone: 'error' },
        };
      }

      const nextStrokeIndex = state.currentStrokeIndex + 1;
      const isComplete = nextStrokeIndex === action.character.strokes.length;
      return {
        ...state,
        acceptedStrokes: [...state.acceptedStrokes, state.currentPoints],
        attempts: [],
        currentPoints: [],
        currentStrokeIndex: nextStrokeIndex,
        feedback: {
          message: isComplete
            ? `¡Bien! Has escrito ${action.character.symbol}.`
            : `¡Bien! Continúa con el trazo ${nextStrokeIndex + 1}.`,
          tone: 'success',
        },
        isComplete,
      };
    }
    case 'cancel':
      return { ...state, currentPoints: [] };
    case 'undo':
      return { ...state, attempts: state.attempts.slice(0, -1), feedback: null };
    case 'reset':
      return initialDrawingState;
  }
}

type KanaWritingCanvasProps = {
  character: KanaCharacter;
  onComplete: () => void;
  onDrawingChange: (isDrawing: boolean) => void;
};

function pointsToPath(points: readonly StrokePoint[]) {
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(2)},${point.y.toFixed(2)}`)
    .join(' ');
}

export function KanaWritingCanvas({
  character,
  onComplete,
  onDrawingChange,
}: KanaWritingCanvasProps) {
  const theme = useTheme();
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({ width: 1, height: 1 });
  const [drawing, dispatch] = useReducer(drawingReducer, initialDrawingState);
  const {
    acceptedStrokes,
    attempts,
    currentPoints,
    currentStrokeIndex,
    feedback,
    isComplete,
  } = drawing;
  const [focusedButton, setFocusedButton] = useState<'continue' | 'undo' | 'reset' | null>(null);
  const expectedStroke = character.strokes[currentStrokeIndex];
  const [minX, minY, width, height] = character.viewBox;

  const pointFromEvent = useCallback(
    (event: GestureResponderEvent): StrokePoint => ({
      x: minX + (event.nativeEvent.locationX / canvasSize.width) * width,
      y: minY + (event.nativeEvent.locationY / canvasSize.height) * height,
    }),
    [canvasSize.height, canvasSize.width, height, minX, minY, width],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !isComplete,
        onMoveShouldSetPanResponder: () => !isComplete,
        onPanResponderGrant: (event) => {
          dispatch({ type: 'start', point: pointFromEvent(event) });
          onDrawingChange(true);
        },
        onPanResponderMove: (event) => {
          dispatch({ type: 'move', point: pointFromEvent(event) });
        },
        onPanResponderRelease: () => {
          dispatch({ type: 'finish', character });
          onDrawingChange(false);
        },
        onPanResponderTerminate: () => {
          dispatch({ type: 'cancel' });
          onDrawingChange(false);
        },
        onPanResponderTerminationRequest: () => false,
      }),
    [character, isComplete, onDrawingChange, pointFromEvent],
  );

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width: layoutWidth, height: layoutHeight } = event.nativeEvent.layout;
    setCanvasSize({ width: layoutWidth, height: layoutHeight });
  };

  return (
    <View style={styles.container}>
      <ThemedText accessibilityLiveRegion="polite" style={styles.instruction}>
        {isComplete
          ? `Has completado los ${character.strokes.length} trazos`
          : `Traza el trazo ${expectedStroke.number} de ${character.strokes.length}`}
      </ThemedText>

      <View
        {...panResponder.panHandlers}
        accessibilityLabel={
          isComplete
            ? `Lienzo de escritura. ${character.symbol} completado`
            : `Lienzo de escritura. Traza el trazo ${expectedStroke.number} de ${character.strokes.length} de ${character.symbol}`
        }
        accessibilityRole="image"
        onLayout={handleLayout}
        style={[
          styles.canvas,
          Platform.OS === 'web' && webCanvasStyle,
          { backgroundColor: theme.backgroundSelected, borderColor: theme.accent },
        ]}>
        <Svg height="100%" viewBox={`${minX} ${minY} ${width} ${height}`} width="100%">
          <Line
            stroke={theme.textSecondary}
            strokeDasharray="3 4"
            strokeOpacity={0.28}
            strokeWidth={0.8}
            x1={width / 2}
            x2={width / 2}
            y1={8}
            y2={height - 8}
          />
          <Line
            stroke={theme.textSecondary}
            strokeDasharray="3 4"
            strokeOpacity={0.28}
            strokeWidth={0.8}
            x1={8}
            x2={width - 8}
            y1={height / 2}
            y2={height / 2}
          />
          {!isComplete && (
            <Path
              d={expectedStroke.path}
              fill="none"
              stroke={theme.textSecondary}
              strokeDasharray="3 3"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity={0.45}
              strokeWidth={6}
            />
          )}
          {acceptedStrokes.map((points, index) => (
            <Path
              d={pointsToPath(points)}
              fill="none"
              key={`accepted-${index}`}
              stroke={theme.accentPressed}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={5}
            />
          ))}
          {attempts.map((points, index) => (
            <Path
              d={pointsToPath(points)}
              fill="none"
              key={`attempt-${index}`}
              stroke={theme.decorationOrange}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={5}
            />
          ))}
          {currentPoints.length > 0 && (
            <Path
              d={pointsToPath(currentPoints)}
              fill="none"
              stroke={theme.decorationPurple}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={5}
            />
          )}
        </Svg>
      </View>

      <ThemedText
        accessibilityLiveRegion="assertive"
        role="status"
        style={[
          styles.feedback,
          feedback && {
            color: feedback.tone === 'success' ? theme.decorationMint : theme.decorationOrange,
          },
        ]}>
        {feedback?.message ?? ''}
      </ThemedText>

      <View style={styles.controls}>
        {(['undo', 'reset'] as const).map((action) => {
          const isUndo = action === 'undo';
          const isDisabled = isUndo
            ? attempts.length === 0
            : attempts.length === 0 && acceptedStrokes.length === 0;

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: isDisabled }}
              disabled={isDisabled}
              key={action}
              onBlur={() => setFocusedButton(null)}
              onFocus={() => setFocusedButton(action)}
              onPress={() => dispatch({ type: isUndo ? 'undo' : 'reset' })}
              style={({ pressed }) => [
                styles.control,
                {
                  backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement,
                  borderColor: isDisabled ? theme.backgroundSelected : theme.accent,
                  opacity: isDisabled ? 0.55 : 1,
                },
                Platform.OS === 'web' && focusedButton === action && {
                  outlineColor: theme.focusRing,
                  outlineStyle: 'solid',
                  outlineWidth: 3,
                  outlineOffset: 2,
                },
              ]}>
              <ThemedText style={styles.controlLabel}>{isUndo ? '↶ Deshacer' : 'Reiniciar'}</ThemedText>
            </Pressable>
          );
        })}
      </View>

      {isComplete && (
        <View style={[styles.continueShadow, { backgroundColor: theme.accentShadow }]}>
          <Pressable
            accessibilityRole="button"
            onBlur={() => setFocusedButton(null)}
            onFocus={() => setFocusedButton('continue')}
            onPress={onComplete}
            style={({ pressed }) => [
              styles.continueButton,
              { backgroundColor: pressed ? theme.accentPressed : theme.accent },
              pressed && styles.continuePressed,
              Platform.OS === 'web' && focusedButton === 'continue' && {
                outlineColor: theme.focusRing,
                outlineStyle: 'solid',
                outlineWidth: 3,
                outlineOffset: 2,
              },
            ]}>
            <ThemedText style={[styles.continueLabel, { color: theme.accentText }]}>
              CONTINUAR
            </ThemedText>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', alignItems: 'center', gap: Spacing.three },
  instruction: { fontSize: 17, lineHeight: 24, fontWeight: 800, textAlign: 'center' },
  canvas: {
    width: '100%',
    maxWidth: 360,
    aspectRatio: 1,
    borderWidth: 2,
    borderRadius: 28,
    overflow: 'hidden',
  },
  controls: { width: '100%', flexDirection: 'row', gap: Spacing.three },
  feedback: { minHeight: 24, textAlign: 'center', fontSize: 15, lineHeight: 22, fontWeight: 700 },
  control: {
    flex: 1,
    minHeight: 48,
    borderWidth: 2,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.two,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  controlLabel: { fontSize: 15, lineHeight: 20, fontWeight: 800, textAlign: 'center' },
  continueShadow: { width: '100%', paddingBottom: 7, borderRadius: 20 },
  continueButton: {
    minHeight: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  continuePressed: { transform: [{ translateY: 4 }] },
  continueLabel: { fontSize: 16, lineHeight: 22, fontWeight: 800 },
});
