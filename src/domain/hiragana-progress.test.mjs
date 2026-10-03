import assert from 'node:assert/strict';
import test from 'node:test';

import { hiraganaLearningGroups, hiraganaLessons, hiraganaPathId, hiraganaVowels } from '../content/japanese/hiragana-lessons.ts';
import { getGroupProgress, getNextLesson } from './progress.ts';
import { createProgressStore } from './progress-store.ts';

test('real Hiragana content survives reopening, repeats and out-of-order completion', async () => {
  const values = new Map();
  const storage = {
    async getItem(key) { return values.get(key) ?? null; },
    async setItem(key, value) { values.set(key, value); },
  };
  const store = createProgressStore(storage);
  const [a, i, u, e, o] = hiraganaLessons;
  await store.completeLesson(hiraganaPathId, o.character.id);
  let completed = await store.readCompleted(hiraganaPathId);
  assert.equal(getGroupProgress(hiraganaVowels, completed).completed, 1);
  assert.equal(getGroupProgress(hiraganaVowels, completed).isComplete, false);
  assert.equal(getNextLesson(hiraganaLearningGroups, completed), a.character.id);

  for (const lesson of [a, i, u]) {
    await store.completeLesson(hiraganaPathId, lesson.character.id);
  }
  const reopened = createProgressStore(storage);
  completed = await reopened.readCompleted(hiraganaPathId);
  assert.equal(getGroupProgress(hiraganaVowels, completed).completed, 4);
  assert.equal(getNextLesson(hiraganaLearningGroups, completed), e.character.id);
  await reopened.completeLesson(hiraganaPathId, e.character.id);
  completed = await reopened.completeLesson(hiraganaPathId, a.character.id);
  assert.deepEqual(getGroupProgress(hiraganaVowels, completed), {
    completed: 5, total: 5, percentage: 100, isComplete: true,
  });
  assert.equal(getNextLesson(hiraganaLearningGroups, completed), null);
});
