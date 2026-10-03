import { hiraganaA, hiraganaI, hiraganaU, hiraganaE, hiraganaO } from './hiragana.ts';

export const hiraganaPathId = 'japanese/hiragana';

/** Only lessons with content and a screen belong to the available learning path. */
export const hiraganaLessons = [
  { character: hiraganaA, href: '/learn/japanese/hiragana/a' },
  { character: hiraganaI, href: '/learn/japanese/hiragana/i' },
  { character: hiraganaU, href: '/learn/japanese/hiragana/u' },
  { character: hiraganaE, href: '/learn/japanese/hiragana/e' },
  { character: hiraganaO, href: '/learn/japanese/hiragana/o' },
] as const;

export const hiraganaVowels = {
  id: 'vowels',
  lessonIds: hiraganaLessons.map(({ character }) => character.id),
};

export const hiraganaLearningGroups = [hiraganaVowels];
