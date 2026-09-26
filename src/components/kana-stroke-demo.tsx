import { useEffect, useState } from 'react';
import { AccessibilityInfo, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Line, Path, Text as SvgText } from 'react-native-svg';

import type { KanaCharacter, KanaStroke } from '@/domain/kana';
import { useTheme } from '@/hooks/use-theme';

const DRAW_LENGTH = 240;
const STROKE_DELAY = 650;
const STROKE_DURATION = 850;
const AnimatedPath = Animated.createAnimatedComponent(Path);

type AnimatedStrokeProps = {
  color: string;
  index: number;
  replayKey: number;
  shouldReduceMotion: boolean;
  stroke: KanaStroke;
};

function AnimatedStroke({ color, index, replayKey, shouldReduceMotion, stroke }: AnimatedStrokeProps) {
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
        fill={color}
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
      accessibilityLabel={`${character.symbol}, ${character.strokes.length} trazos mostrados en orden`}
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
          <AnimatedStroke
            color={theme.text}
            index={index}
            key={stroke.number}
            replayKey={replayKey}
            shouldReduceMotion={shouldReduceMotion || showComplete}
            stroke={stroke}
          />
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
  narrowCanvas: { maxWidth: 260, borderRadius: 22 },
  shortNarrowCanvas: { maxWidth: 220 },
});
