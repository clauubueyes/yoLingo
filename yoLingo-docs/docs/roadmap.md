# yoLingo — Roadmap

## Purpose

This roadmap describes the intended development direction for yoLingo.

It is not a fixed schedule.

The project should progress through small, independently understandable increments. Features may be reordered, removed, or redesigned as we learn more about the product.

---

# Phase 0 — Project Foundation

## Goal

Create a clean and reproducible development environment.

### Tasks

* [ ] Initialize Git repository
* [ ] Add `AGENTS.md`
* [ ] Add product vision
* [ ] Add architecture documentation
* [ ] Add roadmap
* [ ] Initialize Expo application
* [ ] Configure TypeScript
* [ ] Configure linting and formatting
* [ ] Verify the application runs locally

### Outcome

A clean Expo application with project documentation and development conventions.

---

# Phase 1 — Mobile Shell

## Goal

Create the basic application structure.

### Tasks

* [ ] Set up Expo Router
* [ ] Create main navigation
* [ ] Create home screen
* [ ] Create course screen
* [ ] Create dictionary screen
* [ ] Create review screen
* [ ] Create profile/settings screen
* [ ] Establish basic design system
* [ ] Establish reusable UI primitives

### Outcome

A navigable mobile application with placeholder content.

---

# Phase 2 — Learning Domain

## Goal

Create the first version of the learning domain without building the complete product.

### Tasks

* [ ] Define `Language`
* [ ] Define `Course`
* [ ] Define `Lesson`
* [ ] Define `Exercise`
* [ ] Define basic exercise types
* [ ] Define lesson progression
* [ ] Create a simple learning session
* [ ] Track lesson completion

### Outcome

The application can represent and execute a basic lesson.

---

# Phase 3 — First Real Language

## Goal

Build the first complete learning experience.

The initial candidate is Japanese because it exercises many of the architectural requirements that make yoLingo different from generic language-learning applications.

### Japanese scope

* [ ] Japanese language definition
* [ ] Hiragana learning path
* [ ] Hiragana recognition exercises
* [ ] Hiragana reading exercises
* [ ] Hiragana writing exercises
* [ ] Basic Katakana learning path
* [ ] Katakana recognition exercises
* [ ] Basic Japanese vocabulary
* [ ] Basic sentence exercises

### Outcome

A user can complete an initial Japanese learning path from character recognition to simple vocabulary.

---

# Phase 4 — Vocabulary System

## Goal

Turn vocabulary into a first-class part of the application.

### Tasks

* [ ] Define vocabulary model
* [ ] Display vocabulary information
* [ ] Track user vocabulary
* [ ] Save vocabulary
* [ ] Remove vocabulary
* [ ] Create personal vocabulary lists
* [ ] View saved vocabulary
* [ ] Practice saved vocabulary

### Outcome

Users can build their own vocabulary collection independently of the course.

---

# Phase 5 — Dictionary

## Goal

Create an integrated dictionary connected to the learning system.

### Tasks

* [ ] Dictionary search
* [ ] Dictionary entry screen
* [ ] Language-specific dictionary information
* [ ] Connect dictionary entries to vocabulary
* [ ] Save dictionary words
* [ ] Add words directly to lists
* [ ] Search history

### Outcome

A user can discover a word, understand it, save it, and practice it.

---

# Phase 6 — Review System

## Goal

Create a reliable mechanism for retaining learned material.

### Tasks

* [ ] Define review state
* [ ] Record review attempts
* [ ] Track correct/incorrect answers
* [ ] Create review sessions
* [ ] Implement a simple review schedule
* [ ] Show upcoming reviews
* [ ] Improve review scheduling
* [ ] Introduce spaced repetition

### Outcome

The application can automatically bring previously learned material back for review.

---

# Phase 7 — Multiple Languages

## Goal

Validate that the architecture works beyond Japanese.

### Initial languages

* [ ] English
* [ ] German
* [ ] Norwegian
* [ ] Italian
* [ ] French

Japanese should continue to receive language-specific functionality where appropriate.

### Validation

For each new language, identify:

* [ ] Learning progression
* [ ] Vocabulary requirements
* [ ] Grammar requirements
* [ ] Pronunciation requirements
* [ ] Writing requirements
* [ ] Appropriate exercise types

### Outcome

yoLingo supports multiple languages without duplicating the entire application.

---

# Phase 8 — Personalization

## Goal

Adapt learning to the individual user.

### Tasks

* [ ] Track performance by exercise type
* [ ] Track vocabulary difficulty
* [ ] Identify weak areas
* [ ] Recommend review material
* [ ] Adapt exercise selection
* [ ] Create personalized review sessions
* [ ] Show learning insights

### Outcome

Two users following the same language course can receive different practice based on their performance.

---

# Phase 9 — Writing and Advanced Language Features

## Goal

Expand language-specific learning capabilities.

### Potential features

* [ ] Japanese handwriting recognition
* [ ] Japanese stroke-order validation
* [ ] Kanji learning
* [ ] Advanced pronunciation exercises
* [ ] Listening exercises
* [ ] Dictation
* [ ] Grammar-specific exercises
* [ ] Conjugation exercises
* [ ] Speaking exercises

These features should be implemented according to the needs of each language rather than as a mandatory feature set.

---

# Phase 10 — AI Features

## Goal

Use AI to provide learning experiences that are difficult to implement with static content alone.

### Potential features

* [ ] AI explanations
* [ ] Personalized examples
* [ ] Sentence correction
* [ ] Writing feedback
* [ ] Conversational practice
* [ ] AI-generated exercises
* [ ] Adaptive difficulty
* [ ] Contextual vocabulary practice

AI should augment the existing learning system.

---

# Phase 11 — Persistence and Synchronization

## Goal

Allow users to preserve their learning across devices.

### Potential features

* [ ] User accounts
* [ ] Cloud persistence
* [ ] Synchronization
* [ ] Backup
* [ ] Multiple-device support

A backend should be introduced when the product requirements justify it.

---

# Phase 12 — Product Expansion

Potential future areas:

* [ ] More languages
* [ ] More advanced courses
* [ ] More writing systems
* [ ] Community-created lists
* [ ] Import vocabulary
* [ ] External content integration
* [ ] Books/articles vocabulary extraction
* [ ] Media-based learning
* [ ] Advanced statistics
* [ ] Subscription model
* [ ] Offline-first improvements

These are intentionally not part of the initial product scope.

---

# Development Strategy

The roadmap should be implemented through small increments.

For example:

```text
Phase
  ↓
Feature
  ↓
Small task
  ↓
Implementation
  ↓
Test
  ↓
Review
  ↓
Commit
```

Avoid implementing an entire phase in one branch or commit.

A phase may contain dozens of small commits.

---

# Definition of Progress

Progress should be measured by working capabilities, not by the number of files or features created.

A phase is considered successful when the corresponding user experience actually works.

For example:

> "Vocabulary system complete"

should mean:

```text
User finds a word
       ↓
User saves it
       ↓
Word appears in personal vocabulary
       ↓
User can review it
       ↓
Progress is recorded
```

not merely:

> "Vocabulary TypeScript interfaces exist."

---

# Current Priority

The immediate priority is:

```text
Project foundation
      ↓
Expo application
      ↓
Mobile shell
      ↓
Learning domain
      ↓
First Japanese learning experience
```

Everything else should follow from what we learn while building these foundations.
