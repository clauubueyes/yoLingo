import assert from 'node:assert/strict';
import test from 'node:test';

import {
  completeLesson,
  getGroupProgress,
  getNextLesson,
  getPathProgress,
  isGroupUnlocked,
  isLessonComplete,
} from './progress.ts';

const vowels = Object.freeze({
  id: 'vowels',
  lessonIds: Object.freeze(['a', 'i', 'u', 'e', 'o']),
});
const kRow = Object.freeze({ id: 'k-row', lessonIds: Object.freeze(['ka', 'ki']) });
const unavailable = Object.freeze({ id: 's-row', lessonIds: Object.freeze([]) });
const groups = Object.freeze([vowels, kRow, unavailable]);

test('completion accumulates unique IDs without mutating the previous state', () => {
  const previous = Object.freeze(['a', 'i']);
  const completed = completeLesson(previous, 'u');
  assert.deepEqual(completed, ['a', 'i', 'u']);
  assert.deepEqual(previous, ['a', 'i']);
  assert.equal(isLessonComplete(completed, 'u'), true);
  assert.equal(isLessonComplete(completed, 'o'), false);
});

test('repeating an earlier lesson preserves all completed lessons and progress', () => {
  const completed = Object.freeze(['a', 'i', 'u', 'e', 'o', 'ka']);
  const repeated = completeLesson(completed, 'a');
  assert.deepEqual(repeated, completed);
  assert.deepEqual(getPathProgress(groups, repeated), getPathProgress(groups, completed));
  assert.equal(getNextLesson(groups, repeated), 'ki');
});

test('next lesson starts at the first available lesson and fills completion gaps', () => {
  assert.equal(getNextLesson(groups, []), 'a');
  assert.equal(getNextLesson(groups, ['a']), 'i');
  assert.equal(getNextLesson(groups, ['a', 'u', 'o', 'ka', 'unknown']), 'i');
});

test('next lesson crosses group boundaries and stops when available content ends', () => {
  assert.equal(getNextLesson(groups, vowels.lessonIds), 'ka');
  assert.equal(getNextLesson(groups, [...vowels.lessonIds, 'ka', 'ki']), null);
  assert.equal(getNextLesson([vowels, unavailable], vowels.lessonIds), null);
});

test('group unlock requires all preceding available lessons, including gaps', () => {
  assert.equal(isGroupUnlocked(groups, 'vowels', []), true);
  assert.equal(isGroupUnlocked(groups, 'k-row', ['o']), false);
  assert.equal(isGroupUnlocked(groups, 'k-row', ['a', 'u', 'e', 'o', 'ka']), false);
  assert.equal(isGroupUnlocked(groups, 'k-row', vowels.lessonIds), true);
  assert.equal(isGroupUnlocked(groups, 's-row', [...vowels.lessonIds, 'ka', 'ki']), false);
  assert.equal(isGroupUnlocked(groups, 'missing', []), false);
  assert.equal(isGroupUnlocked([unavailable, vowels], 'vowels', []), true);
});

test('unlock checks every preceding group, not only the adjacent one', () => {
  const third = { id: 'third', lessonIds: ['sa'] };
  assert.equal(isGroupUnlocked([...groups, third], 'third', ['ka', 'ki']), false);
  assert.equal(isGroupUnlocked([...groups, third], 'third', [...vowels.lessonIds, 'ka', 'ki']), true);
});

test('group progress handles zero, partial and full completion', () => {
  assert.deepEqual(getGroupProgress(vowels, []), {
    completed: 0, total: 5, percentage: 0, isComplete: false,
  });
  assert.deepEqual(getGroupProgress(vowels, ['a', 'u']), {
    completed: 2, total: 5, percentage: 40, isComplete: false,
  });
  assert.deepEqual(getGroupProgress(vowels, vowels.lessonIds), {
    completed: 5, total: 5, percentage: 100, isComplete: true,
  });
});

test('duplicates and IDs outside the content do not inflate progress', () => {
  assert.deepEqual(getGroupProgress(vowels, ['a', 'a', 'unknown', 'ka']), {
    completed: 1, total: 5, percentage: 20, isComplete: false,
  });
  assert.deepEqual(completeLesson(['a', 'a', 'i'], 'a'), ['a', 'i']);
});

test('path progress counts lessons rather than averaging groups', () => {
  const progress = getPathProgress(groups, vowels.lessonIds);
  assert.equal(progress.completed, 5);
  assert.equal(progress.total, 7);
  assert.equal(progress.percentage, (5 / 7) * 100);
  assert.equal(progress.isComplete, false);
  assert.equal(getPathProgress(groups, [...vowels.lessonIds, 'ka', 'ki']).isComplete, true);
});

test('empty content has zero progress and no next lesson', () => {
  const emptyProgress = { completed: 0, total: 0, percentage: 0, isComplete: false };
  assert.deepEqual(getGroupProgress(unavailable, ['unknown']), emptyProgress);
  assert.deepEqual(getPathProgress([], ['a']), emptyProgress);
  assert.deepEqual(getPathProgress([unavailable], []), emptyProgress);
  assert.equal(getNextLesson([], []), null);
  assert.equal(getNextLesson([unavailable], []), null);
});

test('progress and next lesson adjust when available content changes', () => {
  const completed = ['a', 'i'];
  const initial = [{ id: 'group', lessonIds: ['a', 'i'] }];
  const expanded = [{ id: 'group', lessonIds: ['a', 'i', 'u'] }];
  const reduced = [{ id: 'group', lessonIds: ['a'] }];
  assert.equal(getPathProgress(initial, completed).percentage, 100);
  assert.equal(getPathProgress(expanded, completed).percentage, (2 / 3) * 100);
  assert.equal(getNextLesson(expanded, completed), 'u');
  assert.deepEqual(getPathProgress(reduced, completed), {
    completed: 1, total: 1, percentage: 100, isComplete: true,
  });
});
