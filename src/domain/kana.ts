export type StrokePoint = Readonly<{
  x: number;
  y: number;
}>;

export type KanaStroke = Readonly<{
  number: number;
  path: string;
  labelPosition: StrokePoint;
  referencePoints: readonly StrokePoint[];
}>;

export type KanaCharacter = Readonly<{
  id: string;
  symbol: string;
  reading: string;
  system: 'hiragana' | 'katakana';
  viewBox: readonly [number, number, number, number];
  strokes: readonly KanaStroke[];
  source: Readonly<{
    name: string;
    url: `https://${string}`;
    license: string;
    licenseUrl: `https://${string}`;
  }>;
}>;
