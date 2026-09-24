import assert from 'node:assert/strict';
import test from 'node:test';

import { normalizeStroke, validateKanaStroke } from './kana-validation.ts';

const horizontal = [
  { x: 20, y: 30 },
  { x: 40, y: 30 },
  { x: 60, y: 30 },
  { x: 80, y: 30 },
];
const vertical = [
  { x: 50, y: 15 },
  { x: 50, y: 40 },
  { x: 50, y: 65 },
  { x: 50, y: 90 },
];
const character = {
  id: 'test-kana',
  symbol: 'あ',
  reading: 'a',
  system: 'hiragana',
  viewBox: [0, 0, 109, 109],
  strokes: [
    { number: 1, path: '', labelPosition: horizontal[0], referencePoints: horizontal },
    { number: 2, path: '', labelPosition: vertical[0], referencePoints: vertical },
  ],
  source: {
    name: 'test',
    url: 'https://example.com',
    license: 'test',
    licenseUrl: 'https://example.com/license',
  },
};

test('normalizes canvas coordinates into the 0–109 kana space', () => {
  assert.deepEqual(
    normalizeStroke(
      [
        { x: 10, y: 20 },
        { x: 210, y: 120 },
      ],
      { x: 10, y: 20, width: 200, height: 100 },
    ),
    [
      { x: 0, y: 0 },
      { x: 109, y: 109 },
    ],
  );
});

test('accepts a correctly drawn stroke', () => {
  assert.equal(validateKanaStroke(character, 0, horizontal).isValid, true);
});

test('rejects a stroke drawn in reverse', () => {
  assert.equal(validateKanaStroke(character, 0, [...horizontal].reverse()).reason, 'reverse');
});

test('rejects a stroke outside the expected path', () => {
  const displaced = horizontal.map(({ x, y }) => ({ x, y: y + 18 }));
  assert.equal(validateKanaStroke(character, 0, displaced).reason, 'off-path');
});

test('rejects a stroke that is too short', () => {
  assert.equal(
    validateKanaStroke(character, 0, [
      { x: 20, y: 30 },
      { x: 28, y: 30 },
    ]).reason,
    'too-short',
  );
});

test('rejects a valid later stroke when drawn out of order', () => {
  assert.equal(validateKanaStroke(character, 0, vertical).reason, 'wrong-order');
});
