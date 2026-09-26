import { Fragment, useEffect, useState } from 'react';
import { AccessibilityInfo, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Line, Path, Text as SvgText } from 'react-native-svg';

import type { KanaCharacter, KanaStroke, StrokePoint } from '@/domain/kana';
import { useTheme } from '@/hooks/use-theme';

const DRAW_LENGTH = 240;
const STROKE_DELAY = 650;
const STROKE_DURATION = 850;
const AnimatedPath = Animated.createAnimatedComponent(Path);

function ArrowHead({ color, end, previous }: { color: string; end: StrokePoint; previous: StrokePoint }) {
  const length = Math.hypot(end.x - previous.x, end.y - previous.y) || 1;
  const directionX = (end.x - previous.x) / length;
  const directionY = (end.y - previous.y) / length;
  const wingLength = 2.6;
  const wingBack = 3.8;

  return (
    <>
      <Line
        x1={end.x}
        y1={end.y}
        x2={end.x - directionX * wingBack + directionY * wingLength}
        y2={end.y - directionY * wingBack - directionX * wingLength}
        stroke={color}
        strokeLinecap="round"
        strokeWidth={1.2}
      />
      <Line
        x1={end.x}
        y1={end.y}
        x2={end.x - directionX * wingBack - directionY * wingLength}
        y2={end.y - directionY * wingBack + directionX * wingLength}
        stroke={color}
        strokeLinecap="round"
        strokeWidth={1.2}
      />
    </>
  );
}

function StrokeDirection({ color, stroke }: { color: string; stroke: KanaStroke }) {
  const start = stroke.referencePoints[0];
  const next = stroke.referencePoints[Math.min(4, stroke.referencePoints.length - 1)];
  const length = Math.hypot(next.x - start.x, next.y - start.y) || 1;
  const directionX = (next.x - start.x) / length;
  const directionY = (next.y - start.y) / length;
  const arrowStart = { x: start.x - directionX * 15, y: start.y - directionY * 15 };
  const arrowEnd = { x: start.x - directionX * 3.5, y: start.y - directionY * 3.5 };
  const curvePoints = (stroke.referencePoints.length > 20
    ? stroke.referencePoints.slice(12, 19)
    : []
  ).map((point) => {
    const fromCenterX = point.x - 54.5;
    const fromCenterY = point.y - 54.5;
    const distance = Math.hypot(fromCenterX, fromCenterY) || 1;

    return {
      x: point.x + (fromCenterX / distance) * 8,
      y: point.y + (fromCenterY / distance) * 8,
    };
  });
  const curvePath =
    curvePoints.length > 1
      ? `M${curvePoints[0].x},${curvePoints[0].y} C${curvePoints[1].x},${curvePoints[1].y} ${curvePoints[2].x},${curvePoints[2].y} ${curvePoints[3].x},${curvePoints[3].y} S${curvePoints[5].x},${curvePoints[5].y} ${curvePoints[6].x},${curvePoints[6].y}`
      : '';

  return (
    <>
      <Line
        x1={arrowStart.x}
        y1={arrowStart.y}
        x2={arrowEnd.x}
        y2={arrowEnd.y}
        stroke={color}
        strokeLinecap="round"
        strokeWidth={1.2}
      />
      <ArrowHead color={color} end={arrowEnd} previous={arrowStart} />
      {curvePoints.length > 1 && (
        <>
          <Path
            d={curvePath}
            fill="none"
            stroke={color}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.2}
          />
          <ArrowHead
            color={color}
            end={curvePoints[curvePoints.length - 1]}
            previous={curvePoints[curvePoints.length - 2]}
          />
        </>
      )}
    </>
  );
}

type AnimatedStrokeProps = {
  color: string;
  index: number;
  labelColor: string;
  replayKey: number;
  shouldReduceMotion: boolean;
  stroke: KanaStroke;
};

function AnimatedStroke({ color, index, labelColor, replayKey, shouldReduceMotion, stroke }: AnimatedStrokeProps) {
  const progress = useSharedValue(shouldReduceMotion ? 1 : 0);

  useEffect(() => {
    if (shouldReduceMotion) {
      progress.value = 1;
      return;
    }

    progress.value = 0;
    progress.value = withDelay(
      index * STROKE_DELAY,
      withTiming(1, { duration: STROKE_DURATION, easing: Easing.inOut(Easing.cubic) }),
    );
  }, [index, progress, replayKey, shouldReduceMotion]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: DRAW_LENGTH * (1 - progress.value),
  }));

  return (
    <>
      <AnimatedPath
        animatedProps={animatedProps}
        d={stroke.path}
        fill="none"
        stroke={color}
        strokeDasharray={`${DRAW_LENGTH} ${DRAW_LENGTH}`}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={5}
      />
      <SvgText
        fill={labelColor}
        fontSize={9}
        fontWeight="700"
        textAnchor="middle"
        x={stroke.labelPosition.x}
        y={stroke.labelPosition.y}>
        {stroke.number}
      </SvgText>
    </>
  );
}

type KanaStrokeDemoProps = {
  character: KanaCharacter;
  replayKey: number;
  showComplete?: boolean;
};

export function KanaStrokeDemo({ character, replayKey, showComplete = false }: KanaStrokeDemoProps) {
  const theme = useTheme();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);
  const [minX, minY, width, height] = character.viewBox;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setShouldReduceMotion);
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setShouldReduceMotion,
    );

    return () => subscription.remove();
  }, []);

  return (
    <View
      accessibilityLabel={`${character.symbol}, ${character.strokes.length} trazos mostrados en orden con flechas de dirección`}
      accessibilityRole="image"
      style={[
        styles.canvas,
        windowHeight < 800 && styles.shortCanvas,
        windowWidth < 480 && styles.narrowCanvas,
        windowHeight < 700 && windowWidth < 480 && styles.shortNarrowCanvas,
        { backgroundColor: theme.backgroundSelected },
      ]}>
      <Svg
        aria-hidden
        height="100%"
        viewBox={`${minX} ${minY} ${width} ${height}`}
        width="100%">
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
        {character.strokes.map((stroke, index) => (
          <Fragment key={stroke.number}>
            <StrokeDirection color={theme.decorationOrange} stroke={stroke} />
            <AnimatedStroke
              color={theme.text}
              index={index}
              labelColor={theme.decorationOrange}
              replayKey={replayKey}
              shouldReduceMotion={shouldReduceMotion || showComplete}
              stroke={stroke}
            />
          </Fragment>
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    width: '100%',
    maxWidth: 320,
    aspectRatio: 1,
    borderRadius: 28,
    overflow: 'hidden',
  },
  shortCanvas: { maxWidth: 280 },
  narrowCanvas: { maxWidth: 280, borderRadius: 22 },
  shortNarrowCanvas: { maxWidth: 240 },
});
