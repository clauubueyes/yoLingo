const assert = require("node:assert/strict");
const { test } = require("node:test");

const { StudySession } = require("../../src/yolingo/web/static/study-session.js");

const cards = [
  {
    term: "god morgen",
    translation: "buenos días",
    example: "God morgen!",
    notes: "Antes del mediodía",
  },
  { term: "takk", translation: "gracias", example: null, notes: null },
  { term: "ha det", translation: "adiós", example: null, notes: null },
];

test("starts with a shuffled copy and leaves the received cards unchanged", () => {
  const receivedCards = cards.map((card) => ({ ...card }));
  const session = new StudySession(receivedCards, () => 0);

  assert.deepEqual(
    session.cards.map((card) => card.term),
    ["takk", "ha det", "god morgen"],
  );
  assert.deepEqual(receivedCards, cards);
  assert.notStrictEqual(session.cards[0], receivedCards[1]);
  assert.deepEqual(session.progress, { current: 1, total: 3 });
});

test("exposes only the term until the answer is revealed", () => {
  const session = new StudySession([cards[0]], () => 0);

  assert.deepEqual(session.visibleCard, { term: "god morgen" });
  assert.equal(session.revealAnswer(), true);
  assert.deepEqual(session.visibleCard, cards[0]);
});

test("advances only after revealing and hides the next answer", () => {
  const session = new StudySession(cards.slice(0, 2), () => 0.99);

  assert.equal(session.next(), false);
  assert.equal(session.currentIndex, 0);
  session.revealAnswer();
  assert.equal(session.next(), true);

  assert.equal(session.currentIndex, 1);
  assert.equal(session.isAnswerVisible, false);
  assert.deepEqual(session.visibleCard, { term: "takk" });
  assert.deepEqual(session.progress, { current: 2, total: 2 });
});

test("finishes after the last revealed card", () => {
  const session = new StudySession([cards[0]], () => 0);

  session.revealAnswer();
  assert.equal(session.next(), true);

  assert.equal(session.isFinished, true);
  assert.equal(session.currentCard, null);
  assert.equal(session.visibleCard, null);
  assert.deepEqual(session.progress, { current: 1, total: 1 });
  assert.equal(session.revealAnswer(), false);
  assert.equal(session.next(), false);
});

test("an empty selection is finished immediately", () => {
  const session = new StudySession([]);

  assert.equal(session.isFinished, true);
  assert.deepEqual(session.progress, { current: 0, total: 0 });
  assert.equal(session.currentCard, null);
});

test("restart reshuffles and resets session state", () => {
  const randomValues = [0.99, 0.99, 0, 0];
  const session = new StudySession(cards, () => randomValues.shift());
  const firstOrder = session.cards.map((card) => card.term);
  session.revealAnswer();
  session.next();

  session.restart();

  assert.notDeepEqual(session.cards.map((card) => card.term), firstOrder);
  assert.equal(session.currentIndex, 0);
  assert.equal(session.isAnswerVisible, false);
  assert.equal(session.isFinished, false);
  assert.deepEqual(session.progress, { current: 1, total: 3 });
});

test("rejects invalid construction dependencies", () => {
  assert.throws(() => new StudySession(null), TypeError);
  assert.throws(() => new StudySession([], "random"), TypeError);
});
