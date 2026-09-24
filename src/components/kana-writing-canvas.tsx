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
import { useTheme } from '@/hooks/use-theme';

const webCanvasStyle = { cursor: 'pointer', touchAction: 'none' } satisfies ViewStyle;

type CanvasSize = { width: number; height: number };
type DrawingState = {
  attempts: readonly (readonly StrokePoint[])[];
  currentPoints: readonly StrokePoint[];
};
type DrawingAction =
  | { type: 'start'; point: StrokePoint }
  | { type: 'move'; point: StrokePoint }
  | { type: 'finish' }
  | { type: 'cancel' }
  | { type: 'undo' }
  | { type: 'reset' };

const initialDrawingState: DrawingState = { attempts: [], currentPoints: [] };

function drawingReducer(state: DrawingState, action: DrawingAction): DrawingState {
  switch (action.type) {
    case 'start':
      return { ...state, currentPoints: [action.point] };
    case 'move':
      return { ...state, currentPoints: [...state.currentPoints, action.point] };
    case 'finish':
      return {
        attempts:
          state.currentPoints.length > 1
            ? [...state.attempts, state.currentPoints]
            : state.attempts,
        currentPoints: [],
      };
    case 'cancel':
      return { ...state, currentPoints: [] };
    case 'undo':
      return { ...state, attempts: state.attempts.slice(0, -1) };
    case 'reset':
      return initialDrawingState;
  }
}

type KanaWritingCanvasProps = {
  character: KanaCharacter;
  currentStrokeIndex: number;
  onDrawingChange: (isDrawing: boolean) => void;
};

function pointsToPath(points: readonly StrokePoint[]) {
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(2)},${point.y.toFixed(2)}`)
    .join(' ');
}

export function KanaWritingCanvas({
  character,
  currentStrokeIndex,
  onDrawingChange,
}: KanaWritingCanvasProps) {
  const theme = useTheme();
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({ width: 1, height: 1 });
  const [{ attempts, currentPoints }, dispatch] = useReducer(drawingReducer, initialDrawingState);
  const [focusedButton, setFocusedButton] = useState<'undo' | 'reset' | null>(null);
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
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          dispatch({ type: 'start', point: pointFromEvent(event) });
          onDrawingChange(true);
        },
        onPanResponderMove: (event) => {
          dispatch({ type: 'move', point: pointFromEvent(event) });
        },
        onPanResponderRelease: () => {
          dispatch({ type: 'finish' });
          onDrawingChange(false);
        },
        onPanResponderTerminate: () => {
          dispatch({ type: 'cancel' });
          onDrawingChange(false);
        },
        onPanResponderTerminationRequest: () => false,
      }),
    [onDrawingChange, pointFromEvent],
  );

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width: layoutWidth, height: layoutHeight } = event.nativeEvent.layout;
    setCanvasSize({ width: layoutWidth, height: layoutHeight });
  };

  return (
    <View style={styles.container}>
      <ThemedText accessibilityLiveRegion="polite" style={styles.instruction}>
        Traza el trazo {expectedStroke.number} de {character.strokes.length}
      </ThemedText>

      <View
        {...panResponder.panHandlers}
        accessibilityLabel={`Lienzo de escritura. Traza el trazo ${expectedStroke.number} de ${character.strokes.length} de ${character.symbol}`}
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
          {attempts.map((points, index) => (
            <Path
              d={pointsToPath(points)}
              fill="none"
              key={index}
              stroke={theme.decorationPurple}
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

      <View style={styles.controls}>
        {(['undo', 'reset'] as const).map((action) => {
          const isUndo = action === 'undo';
          const isDisabled = attempts.length === 0;

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
});
