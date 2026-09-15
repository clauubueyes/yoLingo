class StudySession {
  constructor(cards, random = Math.random) {
    if (!Array.isArray(cards)) {
      throw new TypeError("StudySession requires an array of cards.");
    }
    if (typeof random !== "function") {
      throw new TypeError("StudySession requires a random function.");
    }

    this._sourceCards = cards.map((card) => ({ ...card }));
    this._random = random;
    this.cards = [];
    this.currentIndex = 0;
    this.isAnswerVisible = false;
    this.isFinished = false;
    this.restart();
  }

  get currentCard() {
    return this.isFinished ? null : this.cards[this.currentIndex];
  }

  get visibleCard() {
    const card = this.currentCard;
    if (!card) return null;
    if (!this.isAnswerVisible) return { term: card.term };
    return { ...card };
  }

  get progress() {
    return {
      current: this.cards.length === 0 ? 0 : Math.min(this.currentIndex + 1, this.cards.length),
      total: this.cards.length,
    };
  }

  revealAnswer() {
    if (this.isFinished) return false;
    this.isAnswerVisible = true;
    return true;
  }

  next() {
    if (this.isFinished || !this.isAnswerVisible) return false;
    if (this.currentIndex === this.cards.length - 1) {
      this.isFinished = true;
      this.isAnswerVisible = false;
      return true;
    }

    this.currentIndex += 1;
    this.isAnswerVisible = false;
    return true;
  }

  restart() {
    this.cards = this._shuffle(this._sourceCards);
    this.currentIndex = 0;
    this.isAnswerVisible = false;
    this.isFinished = this.cards.length === 0;
    return this;
  }

  _shuffle(cards) {
    const shuffled = cards.map((card) => ({ ...card }));
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const target = Math.floor(this._random() * (index + 1));
      [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
    }
    return shuffled;
  }
}

globalThis.StudySession = StudySession;

if (typeof module !== "undefined") {
  module.exports = { StudySession };
}
