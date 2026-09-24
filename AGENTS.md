AGENTS.md — yoLingo

Project

yoLingo is a language-learning application built with Expo, React Native, TypeScript, and Expo Router. It targets Android and iOS first and also has a responsive web experience.

The product combines language-specific learning paths with a personal dictionary, saved vocabulary, lists, and review. It should help people understand and retain a language, not merely complete exercises. Read VISION.md, ROADMAP.md, and ARCHITECTURE.md when a task concerns product scope or architecture.

How to work with the developer

The developer is learning and wants to make the important implementation decisions. When asked for guidance, explain the relevant concept, give a small next step and a hint, then review her attempt. Provide a complete implementation when she explicitly requests one.

For coding tasks:

Read the relevant documentation and inspect the current code and Git status.

State the smallest coherent change and any important assumption.

Implement only that change; avoid unrelated cleanup.

Run the checks relevant to the change and inspect the result visually for UI work.

Explain what changed, what was checked, and any remaining issue.

Make one focused conventional commit when the task calls for a commit. Stop after that commit and wait for the developer to say “continúa” before starting the next planned commit.

If a requested change requires a major architectural decision, explain the tradeoff before implementing it. Do not expand a small task into a broad rewrite. If the task has several commits, divide the work by commit up front and execute only the first one until the developer continues.

Use commit prefixes such as feat:, fix:, refactor:, docs:, test:, and chore:. Keep each commit independently reviewable. Never commit unrelated user changes.

Scope and dependencies

Prefer Expo and React Native facilities already in the project.

Add a dependency only when it solves a current need. Explain why it is needed and keep its addition isolated where practical.

Introduce backend services, authentication, AI providers, analytics, cloud sync, subscriptions, and similar systems only when the current task requires them or a documented decision calls for them.

Avoid speculative abstractions and large domain models. Add types and fields when a real use case needs them.

Use TypeScript; avoid any and type assertions that merely hide errors.

Product and learning model

Keep a shared learning foundation while allowing each language its own progression and exercise types. Do not treat every course as translated copies of one curriculum.

Japanese learners should be able to start with Hiragana and Katakana. Later work may include Kanji, reading, handwriting, and stroke order. Do not assume they already know kana.

Other languages may need their own grammar, pronunciation, writing, or vocabulary approaches. Add those capabilities as actual lessons require them.

Keep learning content separate from screen rendering and learning rules separate from presentation components.

Treat vocabulary as independent from lessons. A word may come from a lesson, dictionary lookup, personal list, or future source, and the user should be able to save and review it.

Connect dictionary lookup, saved words, personal lists, progress, and review as the product grows. Do not introduce a complex spaced-repetition algorithm before the underlying vocabulary and progress behavior is defined.

Let gamification support learning rather than replace it.

UI across platforms

Design mobile interactions first: readable text, comfortable touch targets, safe areas, clear feedback, and short sessions.

Web should use the available browser space. A desktop browser is not simply a phone screen centered on a wide canvas. Adapt composition, navigation, spacing, and image scale for desktop, while preserving a usable narrow-web layout.

Share content, styling tokens, and behavior where useful. Use responsive layout or platform-specific components when their presentation truly differs; avoid duplicating business or navigation logic.

Keep the welcome screen's current brand assets and copy unless the task asks to change them. Remove remaining Expo starter branding when working on the affected surface.

For visual changes, check at least a typical mobile viewport and, when web is affected, narrow and desktop browser widths. Check scrolling and button visibility on short screens.

Code organization

Give components clear responsibilities. Extract code when a screen becomes difficult to understand, not simply to create more files.

Keep domain logic, data transformation, and persistence out of large presentation components.

Prefer simple local state until the feature requires a wider state solution. Do not change navigation, persistence, or project structure as a side effect of a UI task.

Document decisions that change the product model or architecture; skip documentation of trivial implementation details.

Verification

Run the existing lint and TypeScript checks for code changes. Run focused tests when meaningful behavior is introduced or changed.

Prioritize tests for learning rules, vocabulary transitions, review scheduling, data transformations, and language-specific behavior. Do not add tests that only mirror static visual markup.

For UI work, compare the rendered result with the supplied design on relevant platforms. Say clearly if a device, screenshot, or platform could not be checked.

Report unrelated issues separately instead of silently fixing them in the current commit.