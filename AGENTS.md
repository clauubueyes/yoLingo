# AGENTS.md

## Project Overview

yoLingo is a mobile application for learning languages.

The application is inspired by language-learning apps such as Duolingo, but its core goal is to provide **language-specific learning paths and meaningful personalization**.

Different languages may require fundamentally different learning approaches. For example:

* Japanese requires learning Hiragana and Katakana before relying heavily on vocabulary written in Japanese.
* Japanese may also require handwriting practice and stroke-order recognition.
* German may require explicit work on grammatical gender, cases, and declension.
* Other languages may require different pronunciation, grammar, writing, or vocabulary systems.

yoLingo should therefore provide a **shared learning platform with language-specific learning systems**, rather than treating every language as the same course translated into another language.

The application should also include an integrated dictionary and personal vocabulary system. Users should be able to discover words, save them, organize them into lists, and review them through personalized repetition.

The initial target languages are:

* English
* German
* Japanese
* Norwegian
* Italian
* French

The project should be designed so additional languages can be added without rewriting the core application.

---

## Primary Goals

The project should prioritize:

1. Language-specific learning experiences.
2. Personalization based on the user's progress and weaknesses.
3. Vocabulary discovery and retention.
4. An integrated dictionary.
5. Personal vocabulary lists.
6. Spaced repetition and review.
7. Writing and reading practice where appropriate.
8. A maintainable and extensible architecture.
9. A mobile-first user experience.
10. Small, understandable, independently reviewable changes.

---

## Technology

The initial application is intended to use:

* Expo
* React Native
* TypeScript
* Expo Router

Backend and additional services will be introduced incrementally.

Do not introduce a backend, database, authentication system, AI provider, analytics platform, or other external service unless the current task explicitly requires it or the architectural decision has been documented first.

Prefer Expo and React Native capabilities before introducing additional libraries.

When adding a dependency:

1. Confirm that it is actually necessary.
2. Prefer a well-maintained and widely adopted solution.
3. Avoid adding a dependency for functionality that can reasonably be implemented with the existing stack.
4. Keep the dependency addition isolated in its own change when practical.

---

## Core Architectural Principles

### 1. Shared engine, language-specific content

The application should have a common learning engine while allowing individual languages to define their own learning paths, content types, and exercises.

Do not assume that every language can use the same curriculum structure.

For example, Japanese may require:

```text
Writing systems
    ↓
Hiragana
    ↓
Katakana
    ↓
Basic vocabulary
    ↓
Grammar
    ↓
Kanji
```

while another language may require a completely different progression.

The architecture should support these differences without duplicating the entire application.

---

### 2. Separate learning content from application logic

Learning content should not be tightly coupled to UI components.

Prefer structures that allow:

```text
Language
    ↓
Course
    ↓
Lesson
    ↓
Exercise
    ↓
Learning content
```

to be represented independently from the screens that display them.

UI components should render learning content rather than contain large amounts of hardcoded language-specific logic.

---

### 3. Vocabulary is a first-class concept

Vocabulary should not exist only inside lessons.

A vocabulary item may originate from:

* a course lesson
* the dictionary
* a user-created list
* an AI interaction
* another future source

The system should allow a vocabulary item to become part of the user's personal learning system regardless of where it originated.

Conceptually:

```text
Dictionary
     │
     ├── Search
     │
     └── Save
           │
           ▼
     User Vocabulary
           │
           ├── Lists
           ├── Progress
           └── Review
```

---

### 4. Dictionary and learning system should be connected

The dictionary should not be an isolated lookup feature.

A user should be able to:

1. Search for a word.
2. Understand its meaning and relevant information.
3. Save it.
4. Add it to a personal list.
5. Review it later.
6. Track their progress with it.

---

### 5. Review should be independent from lessons

A user may need to review vocabulary independently of the course progression.

The application should eventually support spaced repetition and personalized review.

The exact algorithm does not need to be decided at the beginning of the project.

Do not prematurely implement a complex spaced-repetition algorithm before the underlying vocabulary and progress models are stable.

---

### 6. Language-specific capabilities

The application should support capabilities that are relevant only to certain languages.

Examples:

* Hiragana recognition
* Katakana recognition
* Kanji recognition
* Handwriting exercises
* Stroke-order exercises
* Romanization
* Pronunciation
* Grammatical gender
* Cases
* Conjugation
* Articles
* Listening exercises

Do not force these concepts into a generic model if doing so makes the architecture confusing.

At the same time, avoid creating completely separate implementations for every language when a reusable abstraction is appropriate.

Prefer:

```text
shared abstraction
+
language-specific configuration/content
```

over:

```text
completely independent implementation per language
```

---

# Development Rules

## Small Changes

Changes should be intentionally small.

A task should ideally implement **one coherent piece of functionality**.

Good examples:

```text
feat: add language selector
feat: add course progress model
feat: add hiragana exercise
feat: add vocabulary bookmark
feat: add dictionary search screen
```

Avoid tasks such as:

```text
feat: build the entire learning system
feat: implement Japanese
feat: build the dictionary
```

If a task becomes large, split it into smaller tasks.

---

## Keep Changes Focused

Do not modify unrelated files or systems while implementing a task.

If you discover an unrelated problem:

1. Do not silently fix it.
2. Mention it.
3. Create a separate task if appropriate.

Avoid drive-by refactors.

---

## Before Changing Architecture

Do not introduce major architectural changes without explaining why they are necessary.

Major changes include:

* changing navigation architecture
* introducing a state-management framework
* introducing a backend
* changing persistence strategy
* introducing a new data layer
* adding a large dependency
* restructuring the project

Prefer the simplest architecture that solves the current problem.

---

## Avoid Premature Abstraction

Do not create generic abstractions simply because something might be reused in the future.

First identify a real repeated pattern.

Prefer simple code over speculative frameworks.

If an abstraction is introduced, it should solve an existing problem rather than a hypothetical one.

---

## TypeScript

Use TypeScript throughout the application.

Prefer explicit domain types for important concepts such as:

```ts
Language
Course
Lesson
Exercise
VocabularyItem
DictionaryEntry
UserVocabulary
Review
```

Avoid `any` unless there is a strong technical reason.

Prefer narrowing unknown data rather than bypassing the type system.

Do not use type assertions to hide type errors without understanding the underlying issue.

---

## Components

React Native components should generally have a clear responsibility.

Avoid very large components that contain:

* navigation
* business logic
* data transformation
* persistence
* complex UI
* learning algorithms

all in the same file.

When a component becomes difficult to understand, consider extracting the appropriate responsibility.

Do not split components into dozens of tiny files without a real benefit.

---

## Business Logic

Learning logic should not be implemented directly inside presentation components.

For example, avoid putting vocabulary-review algorithms directly inside a screen component.

Prefer separating:

```text
UI
↓
Application logic
↓
Domain logic
↓
Data/persistence
```

The exact implementation can evolve as the project grows.

---

## Data Models

Domain models should represent the concepts of the learning system rather than the current UI.

For example, do not design a vocabulary model solely around what happens to be displayed on one screen.

A vocabulary item may eventually need:

* language
* written form
* reading
* pronunciation
* translation
* meanings
* examples
* difficulty
* source
* user progress

Only add fields when there is a real requirement for them.

Avoid creating huge models containing every conceivable future property.

---

# Japanese Language Requirements

Japanese is an important early use case for yoLingo.

The architecture must support Japanese-specific learning features.

### Writing systems

Japanese content may contain:

* Hiragana
* Katakana
* Kanji
* Latin/Romaji

These should be treated as meaningful linguistic information rather than plain text whenever the learning experience requires it.

### Handwriting

The application should eventually support exercises where the user draws Japanese characters with their finger.

These exercises may evaluate:

* character identity
* approximate shape
* stroke order
* stroke direction
* completion

Do not implement handwriting recognition prematurely.

First establish the domain model and exercise architecture that can represent handwriting exercises.

### Reading progression

Japanese lessons should be capable of establishing a progression such as:

```text
Character recognition
        ↓
Character reading
        ↓
Character writing
        ↓
Simple words
        ↓
Simple sentences
```

Do not assume that users already know kana.

---

# AI Usage

AI is expected to be used heavily during development.

The AI should behave as a coding assistant, not as the owner of the architecture.

When working on a task:

1. Read the relevant project documentation.
2. Inspect the existing implementation.
3. Understand the current architecture.
4. Make the smallest reasonable change.
5. Avoid unrelated modifications.
6. Run relevant checks.
7. Explain what changed.
8. Mention any assumptions or unresolved issues.

Do not rewrite large portions of the project simply because another architecture might be preferable.

When uncertain about an important architectural decision, ask before making a large change.

---

# Testing

Tests should be introduced alongside functionality where the behavior is important or non-trivial.

Prioritize tests for:

* domain logic
* learning algorithms
* vocabulary state transitions
* review scheduling
* data transformations
* language-specific rules

Purely visual components do not necessarily require extensive tests unless they contain meaningful behavior.

Do not create meaningless tests solely to increase coverage.

---

# Git and Commits

Commits should be small and focused.

Use conventional commit-style prefixes:

```text
feat:
fix:
refactor:
docs:
test:
chore:
```

Examples:

```text
docs: add project vision
chore: initialize Expo app
feat: add language selector
feat: add vocabulary model
test: add vocabulary review tests
fix: prevent duplicate vocabulary entries
```

A commit should ideally represent one logical change.

Avoid commits such as:

```text
feat: everything
fix: various things
update: project
```

Do not mix unrelated refactoring with feature work unless necessary.

---

# Documentation

Documentation should evolve with the project.

Important architectural or product decisions should be documented when they become relevant.

Do not attempt to document every implementation detail.

Documentation should answer questions such as:

* What problem are we solving?
* Why does the architecture work this way?
* What are the important domain concepts?
* What assumptions are we making?
* What decisions have already been made?

If the implementation changes an architectural decision, update the relevant documentation in the same change when practical.

---

# UI and UX Principles

The application is mobile-first.

Prioritize:

* touch-friendly controls
* readable typography
* clear feedback
* short learning sessions
* minimal cognitive overload
* obvious progress
* fast interactions

Learning exercises should make the required action obvious.

For example, if an exercise asks the user to write a Japanese character, the UI should clearly communicate:

```text
What to write
↓
How to write it
↓
User input
↓
Feedback
```

Do not optimize for visual complexity.

A simple, understandable interface is preferable to a feature-heavy interface.

---

# Product Principles

yoLingo should not blindly copy existing language-learning applications.

When designing a feature, ask:

1. Does this help the user learn?
2. Can the feature adapt to the language being learned?
3. Can the user's individual progress influence it?
4. Can the user understand why they are doing the exercise?
5. Does the feature work with the broader learning system?

Gamification can be used, but it should support learning rather than replace it.

---

# Current Scope

The project is initially focused on establishing the core mobile application and learning architecture.

Do not assume that the following are required immediately:

* authentication
* cloud synchronization
* social features
* leaderboards
* subscriptions
* advertisements
* AI tutor
* advanced analytics
* complex gamification

These may be added later.

Build the foundation first.

---

# Working Rule

When implementing a new feature, prefer this order:

```text
Understand
   ↓
Design the smallest solution
   ↓
Implement
   ↓
Test
   ↓
Review
   ↓
Commit
```

If a task cannot be implemented cleanly in a small change, stop and split the task rather than expanding the scope.

The goal is not to build yoLingo as quickly as possible.

The goal is to build a codebase that can evolve safely as the learning model becomes better understood.
