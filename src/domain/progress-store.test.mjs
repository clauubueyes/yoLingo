import assert from 'node:assert/strict';
import test from 'node:test';

import { createProgressStore } from './progress-store.ts';

const path = 'japanese/hiragana';
const key = 'yolingo:progress:v1:japanese%2Fhiragana';

function memoryStorage(initial = []) {
  const values = new Map(initial);
  return {
    values,
    async getItem(key) { return values.get(key) ?? null; },
    async setItem(key, value) { values.set(key, value); },
  };
}

test('missing data starts empty without writing to storage', async () => {
  const storage = memoryStorage();
  assert.deepEqual(await createProgressStore(storage).readCompleted(path), []);
  assert.equal(storage.values.size, 0);
});

test('completion persists and survives a new store instance', async () => {
  const storage = memoryStorage();
  const store = createProgressStore(storage);
  assert.deepEqual(await store.completeLesson(path, 'a'), ['a']);
  assert.deepEqual(await store.completeLesson(path, 'i'), ['a', 'i']);
  assert.equal(storage.values.get(key), '["a","i"]');
  const reopened = createProgressStore(storage);
  assert.deepEqual(await reopened.readCompleted(path), ['a', 'i']);
  assert.deepEqual(await reopened.completeLesson(path, 'a'), ['a', 'i']);
});

test('progress is isolated by path, including IDs with special characters', async () => {
  const store = createProgressStore(memoryStorage());
  await store.completeLesson(path, 'a');
  await store.completeLesson('japanese/katakana', 'a');
  await store.completeLesson('japanese%2Fhiragana', 'i');
  assert.deepEqual(await store.readCompleted(path), ['a']);
  assert.deepEqual(await store.readCompleted('japanese/katakana'), ['a']);
  assert.deepEqual(await store.readCompleted('japanese%2Fhiragana'), ['i']);
});

test('invalid JSON and invalid root values recover as empty without rewriting on read', async () => {
  for (const raw of ['{broken', 'null', '{}', '42', '"a"']) {
    const storage = memoryStorage([[key, raw]]);
    const store = createProgressStore(storage);
    assert.deepEqual(await store.readCompleted(path), []);
    assert.equal(storage.values.get(key), raw);
    assert.deepEqual(await store.completeLesson(path, 'a'), ['a']);
    assert.equal(storage.values.get(key), '["a"]');
  }
});

test('partially corrupt arrays retain valid IDs and remove duplicates', async () => {
  const storage = memoryStorage([[key, '["a",null,3,"i","a",""," ",{}]']]);
  const store = createProgressStore(storage);
  assert.deepEqual(await store.readCompleted(path), ['a', 'i']);
  assert.deepEqual(await store.completeLesson(path, 'u'), ['a', 'i', 'u']);
});

test('concurrent completions accumulate and reads wait for preceding writes', async () => {
  const storage = memoryStorage();
  const store = createProgressStore(storage);
  const results = await Promise.all([
    store.completeLesson(path, 'a'),
    store.completeLesson(path, 'i'),
    store.completeLesson(path, 'a'),
    store.completeLesson(path, 'u'),
    store.readCompleted(path),
  ]);
  assert.deepEqual(results, [['a'], ['a', 'i'], ['a', 'i'], ['a', 'i', 'u'], ['a', 'i', 'u']]);
  assert.deepEqual(JSON.parse(storage.values.get(key)), ['a', 'i', 'u']);
});

test('returned arrays cannot mutate persisted progress', async () => {
  const store = createProgressStore(memoryStorage());
  const completed = await store.completeLesson(path, 'a');
  completed.push('i');
  const read = await store.readCompleted(path);
  read.push('u');
  assert.deepEqual(await store.readCompleted(path), ['a']);
});

test('read failures propagate and do not overwrite existing progress', async () => {
  const storage = memoryStorage([[key, '["a"]']]);
  let fail = true;
  const store = createProgressStore({
    ...storage,
    async getItem(key) {
      if (fail) throw new Error('read failed');
      return storage.getItem(key);
    },
  });
  await assert.rejects(store.readCompleted(path), /read failed/);
  await assert.rejects(store.completeLesson(path, 'i'), /read failed/);
  assert.equal(storage.values.get(key), '["a"]');
  fail = false;
  assert.deepEqual(await store.completeLesson(path, 'i'), ['a', 'i']);
});

test('write failures propagate and a retry keeps previously saved lessons', async () => {
  const storage = memoryStorage([[key, '["a"]']]);
  let fail = true;
  const store = createProgressStore({
    ...storage,
    async setItem(key, value) {
      if (fail) throw new Error('write failed');
      return storage.setItem(key, value);
    },
  });
  await assert.rejects(store.completeLesson(path, 'i'), /write failed/);
  assert.deepEqual(await store.readCompleted(path), ['a']);
  fail = false;
  assert.deepEqual(await store.completeLesson(path, 'i'), ['a', 'i']);
});

test('empty path and lesson IDs are rejected without writing', async () => {
  const storage = memoryStorage();
  const store = createProgressStore(storage);
  await assert.rejects(store.readCompleted(' '), /path ID/);
  await assert.rejects(store.completeLesson('', 'a'), /path ID/);
  await assert.rejects(store.completeLesson(path, ' '), /lesson ID/);
  assert.equal(storage.values.size, 0);
});
