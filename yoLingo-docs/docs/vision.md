# yoLingo — Product Vision

## 1. Vision

yoLingo is a mobile-first application for learning languages through **personalized, language-specific learning experiences**.

The goal is not to create another generic language-learning app where every language follows the same structure.

yoLingo should recognize that different languages require different learning approaches and provide the appropriate tools, progression, exercises, and reference material for each one.

The application should combine:

* Structured courses
* Language-specific learning paths
* Interactive exercises
* Writing and reading practice
* An integrated dictionary
* Personal vocabulary
* Spaced repetition
* Progress tracking
* Personalized review
* Eventually, AI-assisted learning

The user should be able to learn from the course, discover language independently, save what they find, and return to it later.

---

# 2. The Problem

Most language-learning applications are built around a common lesson structure that is reused across languages.

This works reasonably well for languages that share similar writing systems and learning requirements, but it can become limiting when a language has fundamentally different characteristics.

Japanese is a clear example.

A beginner learning Japanese may need to learn:

* Hiragana
* Katakana
* Basic pronunciation
* Kanji
* Different reading systems
* Japanese sentence structure

before being able to comfortably learn vocabulary and sentences.

Simply presenting Japanese vocabulary in the same way as English vocabulary does not provide the most appropriate learning progression.

Other languages have their own challenges.

German may require particular attention to:

* Grammatical gender
* Articles
* Cases
* Declension
* Word order

French may require particular attention to:

* Pronunciation
* Verb conjugation
* Gender
* Agreement

Each language should therefore be allowed to define its own learning experience.

---

# 3. Core Idea

yoLingo is built around one central idea:

> **The learning system should adapt to the language, and the learning experience should adapt to the learner.**

There are therefore two dimensions of personalization.

### Language personalization

The application understands that each language may require different:

* Learning paths
* Content
* Exercise types
* Writing systems
* Grammar concepts
* Pronunciation practice
* Vocabulary progression

### Learner personalization

The application should eventually understand:

* What the user already knows
* What they frequently get wrong
* Which vocabulary they struggle with
* Which skills are weaker
* Which words the user wants to learn
* How frequently they review
* What content is relevant to them

These two dimensions should work together.

---

# 4. Learning Model

The application should not treat learning as a simple sequence:

```text
Lesson 1
   ↓
Lesson 2
   ↓
Lesson 3
   ↓
Lesson 4
```

Instead, the learning system should combine several sources of learning:

```text
                 ┌───────────────┐
                 │    COURSE     │
                 └───────┬───────┘
                         │
                         ▼
                    New knowledge
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
      Dictionary     User words      Practice
          │              │              │
          └──────────────┼──────────────┘
                         ▼
                       Review
                         │
                         ▼
                      Mastery
```

The course provides structure.

The dictionary provides exploration.

Personal vocabulary allows the user to decide what is important to them.

Review turns exposure into retention.

---

# 5. Language-Specific Learning

Each language should be able to define its own progression.

For example, a possible Japanese progression could be:

```text
Japanese
│
├── Hiragana
│   ├── Recognition
│   ├── Reading
│   └── Writing
│
├── Katakana
│   ├── Recognition
│   ├── Reading
│   └── Writing
│
├── Basic vocabulary
│
├── Basic grammar
│
├── Kanji
│
├── Sentences
│
└── Listening and conversation
```

A possible German progression could instead be:

```text
German
│
├── Pronunciation
├── Basic vocabulary
├── Articles and gender
├── Sentence structure
├── Verb conjugation
├── Cases
├── Declension
└── Conversation
```

These are examples rather than fixed curricula.

The important principle is that the application architecture must allow them to be different.

---

# 6. Writing Systems

Writing systems should be treated as an important part of language learning when appropriate.

For Japanese, yoLingo should eventually support interactive handwriting exercises.

A user may be asked to:

1. Observe a character.
2. Learn its pronunciation.
3. See its stroke order.
4. Draw it.
5. Receive feedback.
6. Recognize it later without assistance.
7. Use it inside words and sentences.

For example:

```text
あ
↓
a
↓
あさ
↓
asa
↓
morning
```

The objective is not simply to memorize an isolated symbol.

The user should progressively connect:

**shape → sound → reading → word → meaning → context**

The same principle should be applied to other writing systems when relevant.

---

# 7. Exercises

Exercises should reinforce the specific skill being learned.

Possible exercise types include:

### Vocabulary

* Multiple choice
* Flashcards
* Word matching
* Fill in the blank
* Recall
* Translation

### Reading

* Character recognition
* Word recognition
* Sentence comprehension
* Reading aloud

### Writing

* Handwriting
* Character reproduction
* Spelling
* Sentence construction

### Listening

* Listen and identify
* Dictation
* Word recognition
* Sentence comprehension

### Grammar

* Fill in the blank
* Sentence construction
* Word ordering
* Conjugation
* Error correction

### Speaking

* Pronunciation
* Repetition
* Guided conversation
* Free conversation

Not every language needs every exercise type.

The available exercises should depend on the language and the learner's current needs.

---

# 8. Dictionary

The dictionary is a core part of yoLingo rather than an auxiliary feature.

Users should be able to search for words and obtain useful information about them.

Depending on the language, an entry may contain:

* Written form
* Reading
* Pronunciation
* Translation
* Definitions
* Grammatical information
* Example sentences
* Related forms
* Audio

The amount and type of information should depend on the language.

For example, a Japanese dictionary entry may need to distinguish:

```text
大丈夫
だいじょうぶ
daijoubu
```

while a German entry may need information about:

```text
der Tisch
```

including its grammatical gender.

---

# 9. Personal Vocabulary

Users should be able to turn dictionary discoveries into personal learning material.

For example:

```text
Search word
    ↓
Read definition
    ↓
Add to vocabulary
    ↓
Optional: add to a list
    ↓
Review
    ↓
Track progress
```

Users should be able to create lists such as:

* Difficult words
* Travel
* Food
* Work
* Words from a book
* Words from a TV show
* Personal goals

This means the user's learning experience is not limited to the content created by yoLingo.

---

# 10. Review and Spaced Repetition

Vocabulary and other learning items should eventually be reviewed according to the user's memory and performance.

A simplified model is:

```text
New
 ↓
Learning
 ↓
Familiar
 ↓
Strong
 ↓
Mastered
```

Correct answers should generally increase the interval before the next review.

Incorrect answers should generally bring the item back sooner.

The exact spaced-repetition algorithm is intentionally left open at this stage.

The first priority is to create a reliable model for:

* Learning items
* User progress
* Review history
* Review state

The review algorithm can evolve independently.

---

# 11. Personalization

yoLingo should eventually build a model of the learner's strengths and weaknesses.

For example:

```text
Japanese

Reading       ████████░░ 80%
Vocabulary    ██████░░░░ 60%
Grammar       █████░░░░░ 50%
Listening     ████░░░░░░ 40%
Writing       ███████░░░ 70%
```

The application can then use this information to decide what the user should practice.

For example:

> Your listening performance has been weaker recently. Today's review includes additional listening exercises.

Personalization should be based on observed learning behavior rather than arbitrary difficulty.

---

# 12. User-Controlled Learning

The application should guide the learner without completely controlling their learning.

Users should be able to:

* Follow the course
* Search the dictionary
* Save words
* Create lists
* Review selected words
* Explore topics
* Practice specific skills

The user should be able to say:

> "I want to learn these words."

and yoLingo should be able to turn that intention into useful practice.

---

# 13. AI

AI is a future component of yoLingo, not the foundation of the initial product.

Potential uses include:

* Conversational practice
* Explanations
* Sentence generation
* Personalized exercises
* Writing correction
* Pronunciation feedback
* Adapting exercises to the learner
* Explaining grammar in different ways
* Generating contextual examples

AI should complement the structured learning system.

It should not replace the underlying curriculum, vocabulary model, progress tracking, or review system.

The application should remain useful without requiring AI for every interaction.

---

# 14. Multiple Languages

The initial languages are:

* English
* German
* Japanese
* Norwegian
* Italian
* French

The architecture should support adding additional languages later.

Adding a new language should primarily involve defining:

* Language metadata
* Learning path
* Content
* Vocabulary
* Grammar concepts
* Relevant exercise types
* Language-specific capabilities

It should not require rebuilding the entire application.

---

# 15. Mobile-First

yoLingo is primarily a mobile application.

Learning sessions should work well in short periods of time.

A user should be able to open the application and complete a useful learning activity in a few minutes.

The interface should prioritize:

* Touch interaction
* Clear visual feedback
* Readability
* Simple navigation
* Fast interactions
* Minimal friction
* Progress visibility

---

# 16. Product Principles

### Learn before gamifying

Gamification should support learning rather than become the purpose of the application.

### Context over isolated memorization

Words and concepts should eventually be encountered in meaningful contexts.

### Language-specific over generic

If a language requires a different approach, the application should support it.

### Personalization over repetition

The application should eventually spend more time on what the learner needs rather than treating every learner identically.

### User ownership

Users should be able to build their own vocabulary and learning material.

### Simplicity before complexity

The first implementation should solve the fundamental learning problem before adding advanced features.

### Incremental development

The product should evolve through small, independently understandable improvements.

---

# 17. Initial Product Scope

The initial product should focus on proving the core learning loop:

```text
Learn
  ↓
Practice
  ↓
Make mistakes
  ↓
Review
  ↓
Improve
```

The first version does not need:

* Social features
* Leaderboards
* Subscriptions
* Advertising
* Complex achievements
* Advanced analytics
* AI conversation
* Cloud synchronization

These can be considered later.

The initial goal is to prove that the core learning experience is useful.

---

# 18. Long-Term Vision

The long-term goal is for yoLingo to become a **personal language-learning environment** rather than simply a collection of courses.

A user should be able to:

```text
Learn from the course
        ↓
Encounter an unknown word
        ↓
Look it up in the dictionary
        ↓
Save it
        ↓
Organize it
        ↓
Practice it
        ↓
Use it in context
        ↓
Review it
        ↓
Master it
```

The system should continuously connect these activities.

The result should be an application where structured teaching, personal discovery, and intelligent review form a single learning system.
