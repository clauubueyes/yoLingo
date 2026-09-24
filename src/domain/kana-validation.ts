import type { KanaCharacter, StrokePoint } from './kana.ts';

export const KANA_VALIDATION_THRESHOLDS = {
  endpointDistance: 20,
  meanDistance: 14,
  pathDistance: 20,
  pathCoverage: 0.8,
  minimumLengthRatio: 0.35,
} as const;

const SAMPLE_COUNT = 32;

export type StrokeBounds = Readonly<{
  x: number;
  y: number;
  width: number;
  height: number;
}>;

export type StrokeValidationReason =
  | 'too-short'
  | 'reverse'
  | 'wrong-order'
  | 'start'
  | 'end'
  | 'off-path';

export type StrokeValidationMetrics = Readonly<{
  startDistance: number;
  endDistance: number;
  meanDistance: number;
  pathCoverage: number;
}>;

export type StrokeValidationResult =
  | Readonly<{ isValid: true; metrics: StrokeValidationMetrics }>
  | Readonly<{
      isValid: false;
      reason: StrokeValidationReason;
      metrics: StrokeValidationMetrics;
    }>;

function distance(first: StrokePoint, second: StrokePoint) {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

function strokeLength(points: readonly StrokePoint[]) {
  return points.slice(1).reduce((total, point, index) => total + distance(points[index], point), 0);
}

export function normalizeStroke(
  points: readonly StrokePoint[],
  source: StrokeBounds,
  target: StrokeBounds = { x: 0, y: 0, width: 109, height: 109 },
): readonly StrokePoint[] {
  if (source.width <= 0 || source.height <= 0) {
    return [];
  }

  return points.map((point) => ({
    x: target.x + ((point.x - source.x) / source.width) * target.width,
    y: target.y + ((point.y - source.y) / source.height) * target.height,
  }));
}

export function resampleStroke(
  points: readonly StrokePoint[],
  sampleCount = SAMPLE_COUNT,
): readonly StrokePoint[] {
  if (points.length === 0 || sampleCount <= 0) {
    return [];
  }
  if (points.length === 1 || sampleCount === 1) {
    return Array.from({ length: sampleCount }, () => points[0]);
  }

  const segments = points.slice(1).map((point, index) => distance(points[index], point));
  const totalLength = segments.reduce((total, length) => total + length, 0);
  if (totalLength === 0) {
    return Array.from({ length: sampleCount }, () => points[0]);
  }

  const sampled: StrokePoint[] = [];
  let segmentIndex = 0;
  let traversed = 0;

  for (let index = 0; index < sampleCount; index += 1) {
    const targetDistance = (totalLength * index) / (sampleCount - 1);
    while (
      segmentIndex < segments.length - 1 &&
      traversed + segments[segmentIndex] < targetDistance
    ) {
      traversed += segments[segmentIndex];
      segmentIndex += 1;
    }

    const segmentLength = segments[segmentIndex];
    const ratio = segmentLength === 0 ? 0 : (targetDistance - traversed) / segmentLength;
    const start = points[segmentIndex];
    const end = points[segmentIndex + 1];
    sampled.push({
      x: start.x + (end.x - start.x) * ratio,
      y: start.y + (end.y - start.y) * ratio,
    });
  }

  return sampled;
}

function calculateMetrics(
  attempt: readonly StrokePoint[],
  reference: readonly StrokePoint[],
): StrokeValidationMetrics {
  const sampledAttempt = resampleStroke(attempt);
  const sampledReference = resampleStroke(reference);
  const distances = sampledAttempt.map((point, index) => distance(point, sampledReference[index]));

  return {
    startDistance: distances[0] ?? Number.POSITIVE_INFINITY,
    endDistance: distances.at(-1) ?? Number.POSITIVE_INFINITY,
    meanDistance:
      distances.length === 0
        ? Number.POSITIVE_INFINITY
        : distances.reduce((total, value) => total + value, 0) / distances.length,
    pathCoverage:
      distances.length === 0
        ? 0
        : distances.filter((value) => value <= KANA_VALIDATION_THRESHOLDS.pathDistance).length /
          distances.length,
  };
}

function evaluateAgainstReference(
  attempt: readonly StrokePoint[],
  reference: readonly StrokePoint[],
): StrokeValidationResult {
  const metrics = calculateMetrics(attempt, reference);
  if (
    strokeLength(attempt) <
    strokeLength(reference) * KANA_VALIDATION_THRESHOLDS.minimumLengthRatio
  ) {
    return { isValid: false, reason: 'too-short', metrics };
  }

  const reverseMetrics = calculateMetrics([...attempt].reverse(), reference);
  if (
    reverseMetrics.startDistance <= KANA_VALIDATION_THRESHOLDS.endpointDistance &&
    reverseMetrics.endDistance <= KANA_VALIDATION_THRESHOLDS.endpointDistance &&
    reverseMetrics.meanDistance < metrics.meanDistance
  ) {
    return { isValid: false, reason: 'reverse', metrics };
  }
  if (metrics.startDistance > KANA_VALIDATION_THRESHOLDS.endpointDistance) {
    return { isValid: false, reason: 'start', metrics };
  }
  if (metrics.endDistance > KANA_VALIDATION_THRESHOLDS.endpointDistance) {
    return { isValid: false, reason: 'end', metrics };
  }
  if (
    metrics.meanDistance > KANA_VALIDATION_THRESHOLDS.meanDistance ||
    metrics.pathCoverage < KANA_VALIDATION_THRESHOLDS.pathCoverage
  ) {
    return { isValid: false, reason: 'off-path', metrics };
  }

  return { isValid: true, metrics };
}

export function validateKanaStroke(
  character: KanaCharacter,
  expectedStrokeIndex: number,
  points: readonly StrokePoint[],
): StrokeValidationResult {
  const [x, y, width, height] = character.viewBox;
  const normalized = normalizeStroke(points, { x, y, width, height });
  const expectedStroke = character.strokes[expectedStrokeIndex];
  const result = evaluateAgainstReference(normalized, expectedStroke.referencePoints);

  if (!result.isValid && result.reason !== 'too-short' && result.reason !== 'reverse') {
    const matchesAnotherStroke = character.strokes.some(
      (stroke, index) =>
        index !== expectedStrokeIndex &&
        evaluateAgainstReference(normalized, stroke.referencePoints).isValid,
    );
    if (matchesAnotherStroke) {
      return { ...result, reason: 'wrong-order' };
    }
  }

  return result;
}

export function getStrokeFeedback(reason: StrokeValidationReason) {
  switch (reason) {
    case 'too-short':
      return 'El trazo es demasiado corto. Recorre la guía completa.';
    case 'reverse':
      return 'Prueba en la otra dirección, desde el punto de inicio.';
    case 'wrong-order':
      return 'Ese trazo viene después. Sigue primero la guía resaltada.';
    case 'start':
      return 'Empieza más cerca del inicio de la guía.';
    case 'end':
      return 'Lleva el trazo hasta el final de la guía.';
    case 'off-path':
      return 'Mantén el trazo más cerca de la guía.';
  }
}
