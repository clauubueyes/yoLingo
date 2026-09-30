# yoLingo — Roadmap

## Purpose

This roadmap describes the intended development direction for yoLingo.

It is not a fixed schedule.

The project should progress through small, independently understandable increments. Features may be reordered, removed, or redesigned as we learn more about the product.

**Lee `docs/auditoria.md` antes de planificar.** Los increments de remediación UX de la sección siguiente referencian los hallazgos de esa auditoría por ID (`A-01` … `A-25`).

---

# Estado real (2026-09-30)

Verificado con `npm run lint` (correcto), `npx tsc --noEmit` (correcto) y `npm test` (6/6).

| Fase | Estado | Nota |
| --- | --- | --- |
| 0 — Project Foundation | casi completa | falta `docs/architecture.md` (vacío) y no hay formateador |
| 1 — Mobile Shell | incompleta | hay Stack y 4 pantallas, no hay navegación principal ni inicio |
| 2 — Learning Domain | incompleta | `KanaCharacter` existe; `Language`/`Course`/`Lesson`/`Exercise` no |
| 3 — First Real Language | parcial | 5 de 46 hiragana; el recorrido está bloqueado en varios puntos (A-01…A-05) |
| 4 — Vocabulary System | sin empezar | |
| 5 — Dictionary | sin empezar | |
| 6 — Review System | sin empezar | bloqueado por la ausencia de progreso persistente (A-01) |
| 7 — Multiple Languages | sin empezar | `languages.ts` tiene un idioma; la pantalla promete una elección (A-12) |
| 8 — Personalization | sin empezar | |
| 9 — Writing and Advanced | parcial | la escritura con validación de trazos ya existe y funciona |
| 10 — AI Features | sin empezar | fuera de alcance |
| 11 — Persistence and Sync | sin empezar | en la nube; no confundir con la persistencia local de UX-0 |
| 12 — Product Expansion | sin empezar | fuera de alcance |

**Conclusión:** el producto tiene una calidad de escritura de trazos notable y un recorrido que pierde el progreso del usuario. Antes de añadir más contenido hay que arreglar el recorrido. Añadir か hoy no funcionaría: A-04 hace imposible completar cualquier lección que no sea una vocal.

---

# Remediación UX — orden de ejecución

Esta sección va **antes** que las fases 4-12. Está ordenada por dependencia, no por gravedad: cada increment deja el proyecto en un estado coherente y verificable.

Cada increment es un commit. No agrupar.

## UX-0 · Progreso persistente (desbloquea todo lo demás)

**Why first:** A-01 es la causa raíz de A-06, A-07, A-13 y de la fase 6 completa. Nada de lo demás se puede hacer bien sobre estado en la URL.

| # | Tarea | Hallazgo |
| --- | --- | --- |
| 1 | Añadir script `typecheck` y comprobar que `tsc --noEmit` pasa | A-24 |
| 2 | Crear `src/domain/progress.ts` con las reglas puras: completado, siguiente objetivo, desbloqueo, progreso de grupo y de ruta. Sin React ni navegación | A-01, A-09 |
| 3 | Test de `progress.ts`: siguiente lección, acumulación del conjunto, límites de grupo, `completed` vacío e incompleto | A-23 |
| 4 | **Dependencia nueva, aislada en su propio commit:** `@react-native-async-storage/async-storage`. Es la opción que Expo soporta en web y nativo, y la única forma de que el progreso sobreviva a cerrar la app | A-01 |
| 5 | Crear el store de progreso sobre esa dependencia, con lectura y escritura, tolerante a datos ausentes o corruptos | A-01 |
| 6 | Sustituir los `params: { completed: … }` y las ternarias de `nextLessonHref` por el store. Los parámetros quedan solo como enlace profundo | A-01, A-23 |
| 7 | Eliminar las listas `['a','i']` escritas a mano en las 5 rutas de lección | A-01 |

**Fuera de alcance aquí:** cambiar la UI. Este increment no debe verse; debe notarse que recargar ya no borra nada.

**Verificación:** completar las cinco vocales, cerrar y reabrir la app, recargar en web, repetir お y volver a la ruta. El progreso debe ser estable en los cuatro casos. `npm test` en verde.

## UX-1 · Fundaciones de interfaz (antes de añadir pantallas)

**Why:** A-15 significa que cualquier pantalla nueva añade una tercera variante de breakpoints, foco, pulsación y cabecera. Arreglar esto antes evita arrastrar el mismo coste seis veces más.

| # | Tarea | Hallazgo |
| --- | --- | --- |
| 1 | Un módulo de breakpoints con los umbrales 480 / 800 / 960, en un solo sitio | A-15 |
| 2 | Primitiva `Button` con variantes primaria, secundaria y fantasma, y estados pulsado, hover, foco y deshabilitado. Sustituye 9 anillos de foco y 6 `translateY(4)` | A-15, A-20 |
| 3 | Regla única de mayúsculas aplicada por `Button`: frase para etiquetas, mayúsculas solo para antetítulos | A-20 |
| 4 | `AppHeader` compartido: botón Atrás, marca y slot de progreso, con una sola geometría en todas las pantallas | A-15 |
| 5 | Migrar las 4 pantallas existentes a `Button`, `AppHeader` y breakpoints. Sin cambios de aspecto | A-15 |

**Verificación:** recorrer las 4 pantallas a 360 px, 900 px y 1440 px de ancho, y comprobar que la cabecera no cambia de geometría entre pantallas. En web, tabular por todos los botones y ver un anillo de foco consistente.

## UX-2 · Reparar la ruta

| # | Tarea | Hallazgo |
| --- | --- | --- |
| 1 | Filas bloqueadas como botón deshabilitado real, con `accessibilityState` y motivo visible: "Se desbloquea al completar las vocales" | A-07 |
| 2 | Derivar el progreso de la definición del grupo, no del literal `5`. Un solo sitio muestra "3 de 5" | A-09, A-07 |
| 3 | Ancho de la barra calculado, no encadenado con ternarias | A-09 |
| 4 | Conservar el texto de acción visible ("Continúa", "Empieza aquí") además del número, no en su lugar | A-07 |
| 5 | Resolver la fila "Introducción": contenido real o fuera de la lista. Dejar de repetir el glifo de Vocales | A-08 |
| 6 | Dejar de prometer la Fila K hasta que exista | A-02 |

**Verificación:** ruta con 0, 1, 4 y 5 de 5. Ninguna combinación debe mostrar una barra al 100% equivocada ni un texto que no corresponda.

## UX-3 · Reparar la lección

| # | Tarea | Hallazgo |
| --- | --- | --- |
| 1 | Opciones de lectura en el contenido del carácter, con distractores del mismo grupo. **Sin esto ninguna lección nueva es completable** | A-04 |
| 2 | Cierre siempre visible: toda lección termina mostrando qué se Practiceó, con cuántos trazos y cuántos intentos | A-05 |
| 3 | Contador de intentos y sugerencia de volver a la demostración tras N fallos | A-10 |
| 4 | Tope a los intentos dibujados, para que la guía siga siendo legible | A-10 |
| 5 | `Deshacer` simétrico: deshace el último trazo, sea correcto o fallido | A-10 |
| 6 | Conservar los trazos al cambiar de fase, en vez de desmontar el lienzo | A-19 |
| 7 | `character.introduction` se acorta o se envuelve en pantallas cortas, nunca se oculta | A-11 |
| 8 | Corregir el contador de pasos al número real de fases, y anunciarlo con `accessibilityLiveRegion` | A-11 |
| 9 | Registrar cuántos intentos costó cada trazo, como dato de dominio para el futuro repaso | A-16, A-10 |

**Verificación:** las 5 lecciones terminan con cierre visible. Fallar 20 trazos mantiene la guía legible y muestra un contador. Cambiar de fase y volver conserva el trabajo.

## UX-4 · Accesibilidad de la ruta

**Why:** A-03 es el bloqueo más grave del proyecto. Sin salida en la escritura, parte de los usuarios no puede avanzar nunca.

| # | Tarea | Hallazgo |
| --- | --- | --- |
| 1 | "Saltar escritura" siempre disponible, con la lección completada igualmente | A-03 |
| 2 | Ruta no visual al reconocimiento, para lector de pantalla | A-03 |
| 3 | Respetar el escalado de texto del sistema, con techo razonable en los títulos | A-17 |
| 4 | Nunca deshabilitar el scroll de forma silenciosa; asegurar que el botón de continuar es alcanzable en pantallas cortas | A-18 |
| 5 | Objetivos táctiles por debajo de 48 px solo con justificación, y separación real entre acción principal y destructiva | A-19 |
| 6 | Anunciar el resultado de la validación de trazos, no solo el color | A-11 |

**Verificación:** recorrido completo con TalkBack y con VoiceOver. Texto del sistema al 200% en las 4 pantallas. 360×640 sin scroll imposible.

## UX-5 · Puntos de entrada

| # | Tarea | Hallazgo |
| --- | --- | --- |
| 1 | Inicio con reanudación: "Continúa · う · 3 de 5", o la bienvenida si no hay progreso | A-13 |
| 2 | Ruta `+not-found` con salida al flujo, en lugar de la pantalla por defecto de Expo | A-14 |
| 3 | `select-language`: con un solo idioma no debe ser una elección. Ramificar cuando haya más de uno | A-12 |
| 4 | Semántica `radiogroup`/`radio` coherente con el quiz | A-12 |
| 5 | Glifo, nombre y descripción del idioma en el dato, no en el JSX | A-12 |
| 6 | Reservar espacio para el mensaje de estado solo cuando hay mensaje | A-12 |

**Verificación:** con y sin progreso, la apertura lleva a un sitio útil. `/learn/japanese/hiragana/ka` devuelve algo útil y accionable.

## UX-6 · Higiene

| # | Tarea | Hallazgo |
| --- | --- | --- |
| 1 | Icono, splash y adaptive icon con la paleta de yoLingo, no el azul de Expo | A-22 |
| 2 | Borrar assets de arranque sin usar: `expo-badge*`, `expo-logo`, `react-logo*`, `tutorial-web`, `tabIcons/*`, `expo.icon` | A-22 |
| 3 | Borrar componentes de arranque sin usar: `web-badge`, `hint-row`, `ui/collapsible` | A-22 |
| 4 | Rellenar `README.md`: arranque, checks, estructura | A-22 |
| 5 | Silenciar el aviso `MODULE_TYPELESS_PACKAGE_JSON` en `npm test` | A-24 |
| 6 | Atribución de licencia con aspecto de enlace y `accessibilityHint` | A-21 |

## UX-7 · Señal (para poder decidir)

| # | Tarea | Hallazgo |
| --- | --- | --- |
| 1 | Contadores locales: intentos por trazo, tiempo por lección, lecciones empezadas y terminadas | A-25, A-16 |
| 2 | Reporte de fallos de validación agregados, para calibrar umbrales con datos | A-16, A-25 |
| 3 | Canal de feedback dentro de la app | A-25 |
| 4 | Revisar los umbrales de `KANA_VALIDATION_THRESHOLDS` con los datos del punto 2 | A-16 |

**Nota:** esto es instrumentación local, no analítica ni proveedor externo. El objetivo es poder responder " ¿funciona el recorrido?" con datos y no con una impresión.

---

# Dependencias entre las remediaciones

```text
UX-0  progreso persistente
  │     └─▶ UX-5  puntos de entrada (necesita "continúa donde lo dejaste")
  ▼
UX-1  primitivas de interfaz
  └─▶ UX-2  ruta  ─┐
  └─▶ UX-3  lección ─┼─▶ UX-4  accesibilidad (necesita las salidas ya existentes)
                    └─▶ UX-6  higiene
                          └─▶ UX-7  señal (necesita los flujos estables)
```

UX-1 no depende de UX-0: puede ir en paralelo, pero **no se mezclan en el mismo commit**.

---

# Contenido: la fase 3 sigue abierta

Una vez cerrado UX-3, el siguiente trabajo de contenido es la Fila K, y es la fase que ya se está haciendo commit a commit:

* [ ] `KanaCharacter` de か con datos de trazos atribuidos
* [ ] Ruta de lección de か
* [ ] Fila K en el grupo, con la vocabulary compartida
* [ ] Ejercicio de lectura con distractores de la fila
* [ ] En general: verificar que la ruta deja de prometer lo que no tiene

Al añadir cada carácter, comprobar siempre:

* [ ] `reading` está en las opciones del exercise (A-04)
* [ ] La ruta reconoce el nuevo carácter sin editar literales (A-01, A-09)
* [ ] La lección termina con cierre visible (A-05)
* [ ] La escritura es saltable y accesible sin dibujo (A-03)

---

# Fases de producto (estado anterior, actualizado)

## Phase 0 — Project Foundation

### Goal

Create a clean and reproducible development environment.

### Tasks

* [x] Initialize Git repository
* [x] Add `AGENTS.md`
* [x] Add product vision
* [ ] Add architecture documentation — `docs/architecture.md` está vacío
* [x] Add roadmap
* [x] Initialize Expo application
* [x] Configure TypeScript
* [x] Configure linting — falta formateador
* [x] Verify the application runs locally

### Outcome

A clean Expo application with project documentation and development conventions.

---

## Phase 1 — Mobile Shell

### Goal

Create the basic application structure.

### Tasks

* [x] Set up Expo Router
* [ ] Create main navigation — hay `Stack`; falta la estructura principal
* [ ] Create home screen — la bienvenida existe, el inicio no (A-13, UX-5)
* [ ] Create course screen — parcial: la ruta de Hiragana
* [ ] Create dictionary screen
* [ ] Create review screen
* [ ] Create profile/settings screen
* [ ] Establish basic design system — hay tokens; faltan primitivas (A-15, UX-1)
* [ ] Establish reusable UI primitives — solo `ui/collapsible`, sin usar

### Outcome

A navigable mobile application with placeholder content.

---

## Phase 2 — Learning Domain

### Goal

Create the first version of the learning domain without building the complete product.

### Tasks

* [ ] Define `Language` — hoy es un array plano en `constants/languages.ts`
* [ ] Define `Course`
* [ ] Define `Lesson` — `KanaCharacter` y `HiraganaPathItem` existen, pero no hay un tipo de lección
* [ ] Define `Exercise` — `LessonPhase` es un tipo local dentro de un componente
* [ ] Define basic exercise types — escritura y reconocimiento existen como componentes, no como tipos
* [x] Define lesson progression — vive en la pantalla; falta en el dominio (A-23, UX-0)
* [x] Create a simple learning session
* [x] Track lesson completion — solo por parámetros de URL (A-01, UX-0)

### Outcome

The application can represent and execute a basic lesson.

---

## Phase 3 — First Real Language

### Goal

Build the first complete learning experience.

The initial candidate is Japanese because it exercises many of the architectural requirements that make yoLingo different from generic language-learning applications.

### Japanese scope

* [x] Japanese language definition
* [x] Hiragana learning path
* [x] Hiragana recognition exercises
* [x] Hiragana reading exercises
* [x] Hiragana writing exercises
* [ ] Hiragana Fila K — bloqueada hasta cerrar UX-3 (A-02, A-04)
* [ ] Basic Katakana learning path
* [ ] Katakana recognition exercises
* [ ] Basic Japanese vocabulary
* [ ] Basic sentence exercises

### Outcome

A user can complete an initial Japanese learning path from character recognition to simple vocabulary.

**Not yet reached.** El usuario completa cinco vocales y llega a un callejón sin salida (A-02). El objetivo de esta fase es "reconocimiento → escritura → vocabulario", y hoy termina en "reconocimiento → escritura → promesa incumplida".

---

## Phase 4 — Vocabulary System

### Goal

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

**Blocked by:** UX-0. El vocabulario se guarda en el mismo sitio que el progreso; sin eso no hay nada que enlazar.

---

## Phase 5 — Dictionary

### Goal

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

## Phase 6 — Review System

### Goal

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

**Blocked by:** UX-0 y UX-7. El intento por trazo ya se registra en UX-3; el resto necesita el conteo de la fase 7.

---

## Phase 7 — Multiple Languages

### Goal

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

**Nota:** hasta que haya un segundo idioma, `select-language` no debe fingir ser una elección (A-12, UX-5).

---

## Phase 8 — Personalization

### Goal

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

## Phase 9 — Writing and Advanced Language Features

### Goal

Expand language-specific learning capabilities.

### Potential features

* [x] Japanese handwriting recognition — validación de trazos funcionando
* [x] Japanese stroke-order validation
* [ ] Kanji learning
* [ ] Advanced pronunciation exercises
* [ ] Listening exercises
* [ ] Dictation
* [ ] Grammar-specific exercises
* [ ] Conjugation exercises
* [ ] Speaking exercises

These features should be implemented according to the needs of each language rather than as a mandatory feature set.

---

## Phase 10 — AI Features

### Goal

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

## Phase 11 — Persistence and Synchronization

### Goal

Allow users to preserve their learning across devices.

### Potential features

* [ ] User accounts
* [ ] Cloud persistence
* [ ] Synchronization
* [ ] Backup
* [ ] Multiple-device support

A backend should be introduced when the product requirements justify it.

**Nota:** esto es sincronización en la nube. La persistencia local que necesita el recorrido ya está en UX-0 y no requiere backend.

---

## Phase 12 — Product Expansion

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

**El mismo criterio aplicado al recorrido actual:** el proyecto no puede declararse "la ruta de Hiragana funciona" hasta que un usuario pueda completarla, cerrar la app, volver y retomar donde estaba. Hoy no puede (A-01).

---

# Current Priority

La prioridad inmediata es cerrar la remediación UX antes de añadir contenido:

```text
UX-0  progreso persistente
  ↓
UX-1  primitivas de interfaz
  ↓
UX-2  ruta    ─┐
UX-3  lección ─┴─▶ UX-4  accesibilidad
  ↓
UX-5  puntos de entrada
  ↓
UX-6  higiene
  ↓
UX-7  señal
  ↓
Fila K (fase 3)
  ↓
Vocabulario (fase 4)
```

Rationale: cada uno de los cinco vowels de hoy se pierde al recargar, y añadir un sexto carácter produciría una lección imposible de completar (A-04). Arreglar el recorrido es más barato que deshacer contenido.

Todo lo demás debería seguir de lo que aprendamos al construir estas correcciones.
