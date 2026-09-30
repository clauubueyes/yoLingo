# yoLingo — Auditoría de UX y del recorrido

Fecha: 2026-09-30
Alcance: la ruta completa existente (bienvenida → selección de idioma → ruta de Hiragana → lección de carácter), el sistema visual y la separación dominio/presentación.
Método: lectura de las 9 rutas, los 11 componentes, el contenido, el dominio y sus test; verificación con `npm run lint`, `npx tsc --noEmit` y `npm test`.

---

## 1. Estado verificado

| Comprobación | Resultado |
| --- | --- |
| `npm run lint` | correcto, sin avisos |
| `npx tsc --noEmit` | correcto, sin errores |
| `npm test` | 6/6 pasan (solo `kana-validation`) |
| Rutas existentes | 9 (`/`, `/select-language`, `/learn/japanese/hiragana` + 5 lecciones) |
| Persistencia | ninguna |
| Contenido de lecciones | 5 de 46 hiragana (あ い う え お) |

El código está limpio y bien tipado. Los problemas de esta auditoría no son de calidad de código: son de **modelo de producto y de recorrido**. El progreso no existe como concepto, y eso arrastra a casi todo lo demás.

---

## 2. Resumen de hallazgos

| ID | Severidad | Hallazgo |
| --- | --- | --- |
| [A-01](#a-01) | P0 | El progreso vive en la URL: se pierde al recargar, al cerrar la app y al repetir una lección |
| [A-02](#a-02) | P0 | La ruta promete la Fila K, que no existe, justo en el momento de mayor motivación |
| [A-03](#a-03) | P0 | La escritura es obligatoria y bloqueante: no hay salida ni ruta no visual |
| [A-04](#a-04) | P0 | Las opciones del quiz están fijadas a las 5 vocales: la lección sería imposible para cualquier otro carácter |
| [A-05](#a-05) | P0 | La pantalla de resultado es código muerto en 4 de 5 lecciones |
| [A-06](#a-06) | P1 | "Atrás" borra el progreso en silencio y se presenta como navegación neutra |
| [A-07](#a-07) | P1 | Las 10 filas bloqueadas no son botones, no se anuncian y no explican por qué |
| [A-08](#a-08) | P1 | "Introducción" y "Vocales" muestran el mismo carácter; la primera no es contenido ni es pulsable |
| [A-09](#a-09) | P1 | La barra de progreso tiene aritmética frágil y el máximo está fijado a 5 en 6 sitios |
| [A-10](#a-10) | P1 | Los intentos fallidos se dibujan todos: el lienzo se ensucia y no hay rendición |
| [A-11](#a-11) | P1 | "Paso X de 3" no coincide con los estados, y el significado se borra en pantallas cortas |
| [A-12](#a-12) | P1 | "Selecciona tu idioma" ofrece una opción con un botón deshabilitado como elemento principal |
| [A-13](#a-13) | P2 | No hay inicio: la bienvenida es también la pantalla de "volver" |
| [A-14](#a-14) | P2 | No hay ruta `+not-found`: una URL inválida cae en la pantalla genérica de Expo |
| [A-15](#a-15) | P2 | Breakpoints inconsistentes (900/960) y responsiva duplicada sin primitivas |
| [A-16](#a-16) | P2 | Los umbrales de trazo no están calibrados contra el tamaño del lienzo (≈58 px de margen) |
| [A-17](#a-17) | P2 | No hay soporte de escalado de texto del sistema |
| [A-18](#a-18) | P2 | El scroll se deshabilita al dibujar y no se avisa: el botón puede quedar bajo el pliegue |
| [A-19](#a-19) | P2 | "VER DEMOSTRACIÓN" durante la escritura descarta los trazos sin aviso |
| [A-20](#a-20) | P2 | Criterio de mayúsculas incoherente entre botones y etiquetas |
| [A-21](#a-21) | P2 | La atribución de licencia abre un navegador sin avisar y no parece un enlace |
| [A-22](#a-22) | P3 | Marcaría de Expo sin marcas en icono, splash y assets |
| [A-23](#a-23) | P3 | Las reglas de aprendizaje viven en la pantalla y no tienen un solo test |
| [A-24](#a-24) | P3 | No hay script de `typecheck` |
| [A-25](#a-25) | P3 | Sin telemetría, sin reporte de errores y sin canal de feedback |

---

## 3. El recorrido actual

```
/                                Bienvenida — único CTA: EMPEZAR (push)
└─ /select-language              "Selecciona tu idioma" — 1 opción, CONTINUAR deshabilitado
   └─ CONTINUAR (push)           /learn/japanese/hiragana  — lee ?completed= de la URL
      └─ fila "Vocales" (push)   /learn/japanese/hiragana/a
         ├─ Fase 1  demostración   → COMENZAR PRÁCTICA  ·  REPRODUCIR DE NUEVO
         ├─ Fase 2  escritura      → obligatorio → CONTINUAR  ·  VER DEMOSTRACIÓN (descarta)
         └─ Fase 3  reconocimiento → SIGUIENTE: い
            └─ replace → /i → replace → /u → replace → /e → replace → /o
               └─ Fase 3  reconocimiento → VER RESULTADO
                  └─ Fase 4  resultado
                     ├─ REPASAR VOCALES    → replace → /a
                     └─ VOLVER A LA RUTA   → replace → ?completed=[a,i,u,e,o]

   10 filas "Bloqueado" sin salida
```

Del arranque en frío al primer trazo: **5 pulsaciones** (EMPEZAR → tarjeta → CONTINUAR → Vocales → COMENZAR PRÁCTICA), más un scroll completo por el hero. Nada en el camino dice qué va a pasar ni cuánto tarda.

Tres decisiones de este diagrama explican casi todos los hallazgos:

1. El progreso se pasa como parámetro de URL en un `replace` que **acumula una lista a mano en cada ruta**.
2. El avance entre lecciones es un `replace`, así que la pila de navegación no registra el camino recorrido.
3. Las fases viven en un `useState` dentro del componente de lección, y el contenido de las opciones vive en el componente de exercise.

---

## 4. Hallazgos

### P0 — Bloquean a quien aprende

<a id="a-01"></a>
#### A-01 · El progreso no existe: vive en la URL y se pierde

No hay `AsyncStorage` ni `SecureStore` en `package.json` ni en `src/`. El único estado de progreso es un parámetro de consulta:

- `src/app/learn/japanese/hiragana/a.tsx:14-18` — `router.replace({ pathname, params: { completed: 'a' } })`
- `src/app/learn/japanese/hiragana/index.tsx:20` — `useLocalSearchParams<{ completed?: string | string[] }>()`

Reproducción, pérdida de 5 de 5 a 1 de 5:

1. Completa あ → い → う → え → お. La ruta muestra **5 de 5**.
2. En お, pulsa **REPASAR VOCALES** → `o.tsx:11` hace `replace('/learn/japanese/hiragana/a')`.
3. Vuelve a completar あ y pulsa **VOLVER A LA RUTA** → `a.tsx:14-18` hace `replace({ params: { completed: 'a' } })`.
4. La ruta pasa a **1 de 5** y ofrece い como siguiente objetivo. Las cuatro vocales completadas se han borrado.

Consecuencias:

- **Recargar en móvil, o abrir la app en frío, reinicia el progreso a 0.** En una ruta de 5 caracteres esto no es un detalle: es perder el trabajo de la sesión.
- **No hay forma de retomar.** No existe enlace profundo, ni "continuar", ni estado que leer.
- Cada una de las 5 rutas **reimplementa a mano** la lista de completados (`['a','i']`, `['a','i','u']`, …). Con 46 hiragana son 46 listas escritas a mano, y el orden importa: el usuario puede perder progreso sin tocar nada.
- La lógica de "cuál es el siguiente" es una ternaria de seis niveles en `hiragana/index.tsx:23-42`, fijada a cinco vocales.

Esto no es un bug de navegación: es la ausencia del modelo `Progress` que necesitan la fase 4 y la fase 6 del roadmap, y la base de la visión §10 (repaso) y §11 (personalización). La URL como estado es un parche que se volverá caro.

<a id="a-02"></a>
#### A-02 · La ruta promete la Fila K y no existe

`src/app/learn/japanese/hiragana/index.tsx:112`:

> "Ya reconoces y escribes las cinco vocales. El próximo grupo será la Fila K."

Ese texto aparece **exactamente** cuando el usuario termina las cinco vocales: el pico de motivación de todo el producto. Y la Fila K es una fila `locked` sin `onPress`, es decir un `View` estático (`index.tsx:127-142` y `284-290`).

El resultado es que el mejor momento de la app termina en un callejón sin salida. El usuario no puede saber si か viene, cuándo, o si existe. Peor: si pulsa la fila esperando que haga algo, no ocurre nada.

Dos salidas honestas: entregar か, o dejar de prometer un grupo concreto. Mantener la promesa sin el contenido es peor que no tener ruta.

<a id="a-03"></a>
#### A-03 · La escritura es obligatoria y bloqueante

`src/components/kana-character-lesson.tsx:178-184` — el paso 2 solo se cierra cuando **todos** los trazos validan. No hay saltar, ni crédito parcial, ni límite de intentos, ni modalidad alternativa.

Quedan bloqueados de forma permanente en el paso 2 de 3:

- quien tenga una limitación motora, un temblor o una sujeción atípica,
- quien use apoyo para la mano izquierda con el dispositivo en configuración espejada,
- quien navegue con lector de pantalla: el lienzo es `accessibilityRole="image"` con un `PanResponder` y **no existe ninguna forma no visual de completar el ejercicio**,
- quien dibuje en un trackpad impreciso.

La única salida es el botón Atrás, que **descarta la sesión entera**. Es decir: el bucle de aprendizaje puede terminar en callejón sin salida, y el único camino de vuelta es perder todo.

Choca de frente con la visión §6 (`forma → sonido → lectura → palabra → significado → contexto`) y con AGENTS.md, que pide que la interfaz móvil tenga "clear feedback" y "comfortable touch targets". Es el bloqueo de accesibilidad más grave del proyecto.

<a id="a-04"></a>
#### A-04 · Las opciones del quiz están fijadas a las 5 vocales

`src/components/kana-lesson-completion.tsx:10`:

```ts
const READING_OPTIONS = ['a', 'i', 'u', 'e', 'o'] as const;
```

Módulo de presentación, scope de componente, y el contenido del ejercicio duele aquí.

`isCorrect = selectedReading === character.reading` (línea 24). Para か, cuyo `reading` es `ki`, **ninguna opción puede coincidir jamás**: el botón de continuar (`línea 94`, condicionado a `isCorrect`) no aparece nunca. La lección de か sería imposible de completar.

Es decir: **el siguiente contenido que se añada al proyecto romperá el producto.** Además viola AGENTS.md ("Keep learning content separate from screen rendering"): las opciones son contenido de exercise y viven en el componente que lo pinta.

Y en el caso actual el ejercicio es débil: las 5 opciones se muestran siempre, así que no hay eliminación ni distractores, y se evalúa la memoria inmediata de la demostración que se acaba de ver, no el reconocimiento.

<a id="a-05"></a>
#### A-05 · La pantalla de resultado es código muerto en 4 de 5 lecciones

`src/components/kana-character-lesson.tsx:191-192`:

```tsx
onComplete={nextCharacter ? nextCharacter.onContinue : () => setPhase('result')}
```

あ, い, う y え declaran `nextCharacter`, así que al acertar el quiz **navegan directamente**. Solo お alcanza la fase `'result'`.

Consecuencias:

- El refuerzo "Has escrito あ siguiendo sus 3 trazos" no aparece nunca. El 80% de las sesiones termina sin cierre visible.
- La rama no-vocal de `KanaLessonResult` (líneas 156, 162, 164, 186) es inalcanzable.
- `phaseStep` (línea 39) mapea `demonstration→1, writing→2, else→3` y la interfaz dice "Paso 3 de 3" durante `recognition`, aunque `recognition` solo es el último paso en uno de los cinco casos.

Falta el momento de recompensa, que es la parte del bucle que convierte esfuerzo en ganas de seguir.

---

### P1 — Alto: fricción y pérdida de orientación

<a id="a-06"></a>
#### A-06 · "Atrás" borra el progreso en silencio

`src/components/back-button.tsx:20-27` — `router.canGoBack() ? router.back() : router.replace(fallbackHref)`.

Por el `replace` de `nextCharacter.onContinue`, la entrada que hay debajo de い/う/え/お es la pantalla de ruta, y esa entrada se apiló **sin parámetros** (`select-language.tsx:156` hace `push` a `/learn/japanese/hiragana` a secas).

Resultado: pulsar "← Atrás" en la lección de う, después de cuatro lecciones, devuelve a una ruta que dice **"Empieza aquí" y 0 de 5**, como si no se hubiera hecho nada. Sin aviso. Y la etiqueta dice "Volver a la ruta de Hiragana", que suena a navegación neutra.

Consecuencia añadida: en móvil, el gesto de retroceso del sistema hace exactamente lo mismo.

<a id="a-07"></a>
#### A-07 · Las 10 filas bloqueadas no son botones ni explican nada

`src/app/learn/japanese/hiragana/index.tsx:127-142` — todo lo que no es `vowels` recibe `state='locked'` y `onPress: undefined`, así que `PathItem` devuelve un `View` plano (líneas 284-290).

- No es enfocable, no tiene `accessibilityState={{ disabled: true }}`, no se anuncia como deshabilitado.
- Visualmente es idéntico a una fila activa: mismo tamaño, mismo color, misma posición.
- No hay motivo: nada dice "se desbloquea al completar las vocales".

Y en la fila que sí es pulsable, el texto de estado (líneas 180-187) cambia de "Empieza aquí" a `3 de 5` en cuanto hay progreso. Es decir, **la señal visual de "qué hago ahora" desaparece justo cuando el usuario ha invertido esfuerzo**. El `vowelActionHint` que lo describe (líneas 43-53) solo se usa como `accessibilityHint`, así que quien ve la pantalla nunca lo lee.

<a id="a-08"></a>
#### A-08 · "Introducción" y "Vocales" muestran el mismo carácter

`src/content/japanese/hiragana-path.ts:13` y `:20` — ambos ítems tienen `symbol: 'あ'`. Dos filas consecutivas con el glifo idéntico, sin explicación de por qué.

La fila "Introducción" además no es pulsable, no lleva a ninguna parte y no contiene contenido: es una etiqueta con estado "Orientación" dentro de una lista de lecciones. O es contenido real (una introducción de 30 segundos a qué es hiragana) o no debería estar en la lista.

<a id="a-09"></a>
#### A-09 · Barra de progreso con aritmética frágil y techo fijo en 5

`src/app/learn/japanese/hiragana/index.tsx:170-179`:

```ts
const progressWidth =
  progress === 1 ? '20%' : progress === 2 ? '40%' : progress === 3 ? '60%'
  : progress === 4 ? '80%' : '100%';
```

Cualquier valor fuera de {1,2,3,4} — incluidos 0 y ≥5 — devuelve `100%`. Hoy no se ve porque `progress` solo se renderiza si es truthy, pero es una bomba de relojería en el único indicador de progreso de la app.

Y `5` está escrito a mano en al menos seis sitios: la tarjeta de próximo paso (99), su descripción (108), el estado de la fila (184), el `accessibilityLabel` (240), `accessibilityValue.max` (242) y `aria-valuemax` (245).

No hay distinción entre progreso del grupo y progreso de la ruta. Cuando か se desbloquee, la Vocales seguirá diciendo "5 de 5" — correcto para ese grupo, pero la ruta no tendrá ninguna medida de avance real.

<a id="a-10"></a>
#### A-10 · Los intentos fallidos se dibujan todos y no hay rendición

`src/components/kana-writing-canvas.tsx:239-249` — cada trazo fallido se guarda en `attempts` y se dibuja en naranja con `strokeWidth: 5`. No hay tope.

Tras 15-20 fallos el lienzo es una masa naranja sobre la guía punteada: el usuario ya no ve el trazo que debe copiar, ni reconoce el carácter, ni la forma de referencia. La dificultad sube justo cuando más ayuda hace falta, y el resultado es una pantalla ilegible en lugar de un mensaje.

No hay contador de intentos, ni tras N fallos se sugiere volver a la demostración, ni se relajan los umbrales. `Deshacer` (línea 93) solo quita el último intento **fallido**: no se puede deshacer un trazo correcto sin perder todo con `Reiniciar`, que además borra los trazos aceptados.

El objetivo de `vision.md` §17 es `Aprender → Practicar → Equivocarse → Repasar → Mejorar`. Aquí equivocarse acumula marcas visuales y no convierte nada en aprendizaje.

<a id="a-11"></a>
#### A-11 · "Paso X de 3" no cuadra, y el significado se borra en pantallas cortas

Dos problemas en el mismo componente:

**El contador.** `kana-character-lesson.tsx:39` — hay 4 fases y el contador dice 3. Durante `recognition` el usuario lee "Paso 3 de 3" aunque después haya un cuarto paso (en el único caso en que se alcanza).

**El contenido desaparece.** `kana-character-lesson.tsx:316`:

```ts
shortMobileDescription: { display: 'none' },
```

`character.introduction` es el **único** sitio donde se enseña el sonido en palabras: "あ representa el sonido «a», como en «casa»". En un móvil de 360×640 se elimina entera. El usuario ve el glifo y nunca aprende qué significa.

Eso rompe la cadena de `vision.md` §6 (`forma → sonido → lectura → palabra → significado`) en el dispositivo más probable. Un texto largo debería acortarse o envolverse, nunca desaparecer.

**Ningún anuncio de cambio de fase.** No hay `accessibilityLiveRegion` al cambiar de fase, así que quien usa lector de pantalla no recibe "Paso 2 de 3: escribe あ". Solo existe la etiqueta visual "Paso X de 3", que además está oculta fuera de `isNarrow`.

<a id="a-12"></a>
#### A-12 · "Selecciona tu idioma" ofrece una opción

`src/app/select-language.tsx:27` — `const canContinue = selectedId === 'ja'`, y `src/constants/languages.ts` contiene exactamente un idioma.

Una pantalla de elección múltiple con una única opción, cuyo elemento más prominente es un botón primario deshabilitado. El usuario no puede saber si los otros idiomas no existen, están en camino o no están soportados. `vision.md` §14 promete seis.

Otros puntos en la misma pantalla:

- **Semántica inconsistente dentro de la propia app**: la tarjeta usa `accessibilityRole="button"` con `aria-pressed` y `accessibilityState={{ selected }}`, mientras que el quiz usa correctamente `radiogroup`/`radio` (`kana-lesson-completion.tsx:40,47`). Un botón que finge ser un radio se anuncia de forma distinta según plataforma.
- **El glifo está hardcodeado**: `select-language.tsx:103` pinta `あ` dentro del `languages.map`. Una futura tarjeta alemana mostraría あ.
- `selectionStatus` (líneas 132-136) reserva un `minHeight: 24` vacío permanentemente, dejando un hueco muerto entre las tarjetas y el botón, y recalcula `languages.find(...)` para un nombre que ya está en `selectedId`.
- La selección se pierde al salir, por el mismo motivo que A-01.

---

### P2 — Medio: calidad, accesibilidad y consistencia

<a id="a-13"></a>
#### A-13 · No hay inicio: la bienvenida es también la pantalla de "volver"

`src/app/index.tsx` es el hero de marketing con un único CTA, y no sabe si el usuario ya empezó. Quien vuelve tiene que pulsar EMPEZAR, volver a elegir Japonés y recorrer la ruta para descubrir dónde estaba.

`_layout.tsx` es un `Stack` pelado, sin pestañas. El roadmap fase 1 pide home, curso, diccionario, repaso y perfil: ninguno existe. Y `BottomTabInset` (`constants/theme.ts:84`) y `assets/images/tabIcons/*` ya están en el repositorio, sin usar — la intención de navegación por pestañas se planeó y nunca se implementó.

<a id="a-14"></a>
#### A-14 · No hay ruta `+not-found`

No existe `src/app/+not-found.tsx`. Cualquier URL inválida (`/learn/japanese/hiragana/ka`, un enlace guardado, una errata) renderiza la pantalla de ruta no encontrada por defecto de Expo, con su estilo de arranque y sin forma de volver al flujo de la app. `dist/+not-found.html` confirma que es lo que se publica.

<a id="a-15"></a>
#### A-15 · Breakpoints inconsistentes y responsiva duplicada

Cuatro breakpoints distintos para cuatro pantallas de un mismo flujo:

| Archivo | Línea | Condición |
| --- | --- | --- |
| `src/app/index.tsx` | 18 | `width >= 900` |
| `src/app/select-language.tsx` | 18 | `width >= 900` |
| `src/app/learn/japanese/hiragana/index.tsx` | 18 | `width >= 960` |
| `src/components/kana-character-lesson.tsx` | 28 | `width >= 960` |

Entre 900 y 959 px el usuario recibe una bienvenida de escritorio y un selector de escritorio, y después una ruta y una lección **de móvil**. El diseño se rompe a mitad del recorrido.

Y cada pantalla reimplementa lo mismo:

- el anillo de foco web (`outlineStyle`/`outlineOffset`): 9 sitios,
- el `translateY(4)` al pulsar: 6 sitios,
- la opacidad de deshabilitado, el `cursor: 'pointer'`, el patrón de sombra de botón.

No hay primitiva `Button`. `src/components/ui/collapsible.tsx` es el único componente de `ui/` y no se usa.

**La cabecera tampoco es compartida**, y cambia de geometría durante el recorrido: `select-language.tsx:39` mueve la marca junto al botón Atrás cuando es estrecho, mientras que `hiragana/index.tsx:61-75` y `kana-character-lesson.tsx:64-98` la mantienen apilada; la lección además **oculta la marca** en estrecho (línea 82). El "chrome" de la app muta de una pantalla a otra.

<a id="a-16"></a>
#### A-16 · Los umbrales de trazo no están calibrados contra el lienzo

`src/domain/kana-validation.ts:3-9` define los umbrales en el espacio normalizado de 109 unidades del kana:

```ts
export const KANA_VALIDATION_THRESHOLDS = {
  endpointDistance: 20, meanDistance: 14, pathDistance: 20,
  pathCoverage: 0.8, minimumLengthRatio: 0.35,
};
```

`kana-writing-canvas.tsx:132-138` convierte píxeles del lienzo a ese mismo espacio. Sobre un lienzo de 320 px, 1 px ≈ 0,34 unidades, así que **`endpointDistance: 20` equivale a unos 58 px de margen** en el punto final, y `pathCoverage: 0.8` con `pathDistance: 20` (≈58 px) se cumple casi siempre.

El validador es mucho más permisivo de lo que se siente. "¡Bien!" no significa lo que el alumno supone que significa, y no hay ajuste de dificultad ni datos de calibración.

No se registra **cuántos intentos** costó cada trazo, que es justamente la señal que el sistema de repaso necesitará después (`vision.md` §10 y §11).

Aparte: `normalizeStroke` lleva un destino por defecto `{ x: 0, y: 0, width: 109, height: 109 }` (línea 54) que duplica el supuesto de `character.viewBox`, y `validateKanaStroke` depende de ese defecto. Las dos cosas pueden divergir sin que nada avise.

<a id="a-17"></a>
#### A-17 · No hay soporte de escalado de texto del sistema

Todos los tamaños de fuente son literales en un `StyleSheet`. No hay `allowFontScaling` ajustado, ni rama con `PixelRatio.getFontScale()`, ni `maxFontSizeMultiplier` en ningún sitio de `src/`.

El ajuste de tamaño de texto del sistema operativo se ignora por completo: alguien que necesite 150-200% de texto no puede usar la app. Sumado a A-03, no hay ninguna vía de adaptación.

Contraste: la app **sí** respeta movimiento reducido (`kana-stroke-demo.tsx:137-145`, con `isReduceMotionEnabled` y `reduceMotionChanged`), que es una de las pocas cosas bien hechas de accesibilidad. La omisión en el resto se hace más visible por contraste.

<a id="a-18"></a>
#### A-18 · El scroll se deshabilita al dibujar y el botón puede quedar bajo el pliegue

`src/components/kana-character-lesson.tsx:56` — `scrollEnabled={!isDrawing}`. Mientras se dibuja, la página no hace scroll.

`narrowCharacterCard` (líneas 328-336) pone `padding: 0` y `flexGrow: 1`, y `narrowStageContent` usa `justifyContent: 'center'`. En cuanto aparece el texto de feedback, el botón CONTINUAR puede quedar bajo el pliegue, sin scroll y sin ningún aviso de que la página se desplaza.

Los tamaños de lienzo son 320 → 280 → 240 px (`kana-writing-canvas.tsx:342-352`), así que en un Android de 360×640 el lienzo es de 240 px y la tarjeta completa no cabe.

La única forma de recuperar el scroll es tocar dentro del lienzo, que cuenta como intento de dibujo.

<a id="a-19"></a>
#### A-19 · "VER DEMOSTRACIÓN" durante la escritura descarta los trazos

`kana-character-lesson.tsx:239-242` pone `phase: 'demonstration'`, lo que **desmonta** `KanaWritingCanvas` y pierde todos los trazos aceptados. Sin confirmación, sin aviso, sin guardado.

El botón está a `Spacing.two` (8 px) del primario de 56 px, y en estrecho baja a `minHeight: 44` sin borde (línea 356): objetivo táctil en el mínimo absoluto, visualmente desemphasizado, justo al lado de la acción destructiva.

<a id="a-20"></a>
#### A-20 · Criterio de mayúsculas incoherente

Mayúsculas en todos los botones: EMPEZAR, CONTINUAR, COMENZAR PRÁCTICA, REPRODUCIR DE NUEVO, VOLVER A LA RUTA, REPETIR LECCIÓN, SIGUIENTE: い, VER RESULTADO, REPASAR VOCALES.

Frase en las mismas pantallas: "Reiniciar", "↶ Deshacer", "Paso 1 de 3", "TU PRÓXIMO PASO", "JAPONÉS · PRIMEROS PASOS".

Dentro de una misma vista, el control primario y el secundario discrepan en estilo tipográfico. Debería ser una regla, aplicada por la primitiva, no una decisión por pantalla.

<a id="a-21"></a>
#### A-21 · La atribución de licencia no parece un enlace

`kana-character-lesson.tsx:268-272` — el texto "Trazos: … · CC BY-SA 4.0 ↗" lleva `textDecorationLine: 'underline'` pero conserva el color `textSecondary`, así que se lee como nota al pie estática. `ExternalLink` (`external-link.tsx:8-24`) abre `_blank` en web y navegador in-app en nativo, sin `accessibilityHint`.

El crédito legal de los datos de trazos es correcto y está presente, pero es prácticamente invisible. Solo el glifo `↗` lo delata.

---

### P3 — Higiene

<a id="a-22"></a>
#### A-22 · Marcaría de Expo sin sustituir

- `app.json:15` — `android.adaptiveIcon.backgroundColor: "#E6F4FE"`, y `app.json:31` — splash `backgroundColor: "#208AEF"`. Azul de arranque de Expo, no la paleta de yoLingo (`#FFFCF7` / `#1D4246` / `#63C9B0` en `constants/theme.ts:11-27`).
- Assets de arranque versionados y sin usar: `assets/expo.icon/*`, `assets/images/expo-{badge,badge-white,logo}.png`, `react-logo*.png`, `tutorial-web.png`, `tabIcons/*`. `logo-glow.png` solo lo usa el overlay de splash.
- Componentes de arranque sin usar: `src/components/web-badge.tsx`, `src/components/hint-row.tsx` (su texto por defecto es literalmente "Try editing / app/index.tsx") y `src/components/ui/collapsible.tsx`.
- `README.md` está vacío (0 bytes).

Es el punto pendiente de "Remove remaining Expo starter branding" de AGENTS.md.

<a id="a-23"></a>
#### A-23 · Las reglas de aprendizaje viven en la pantalla y no tienen test

`npm test` cubre solo `kana-validation`: 6 casos de funciones puras. **No hay ningún test** de:

- qué lección va después,
- cómo se calcula el progreso,
- cómo se acumula el conjunto de completados,
- el mapeo de `progressWidth`.

Esas reglas viven en ternarias dentro de componentes (`hiragana/index.tsx:23-53`, seis niveles) y en los `onReturnToPath` de cada ruta, y son precisamente las que A-01 demuestra que están rotas.

AGENTS.md es explícito: "Prioritize tests for learning rules, vocabulary transitions, review scheduling, data transformations". La estructura correcta ya existe y funciona: `domain/kana.ts` + `domain/kana-validation.ts` con test al lado. Las reglas de progresión deberían vivir igual.

<a id="a-24"></a>
#### A-24 · No hay script de `typecheck`

`package.json` tiene `lint` y `test`, pero ningún `typecheck`, pese a tener `typescript ~6.0.3` en devDependencies. `tsc --noEmit` pasa hoy (verificado), pero AGENTS.md instruye ejecutar "the existing lint and TypeScript checks" y ese check no existe como script.

Además `npm test` emite un aviso `MODULE_TYPELESS_PACKAGE_JSON` en cada ejecución.

<a id="a-25"></a>
#### A-25 · Sin telemetría, sin reporte de errores, sin feedback

Nada mide si el recorrido funciona. No hay analítica, ni reporte de errores, ni captura de fallos de validación, ni canal de feedback dentro de la app. Quien se atasca en un trazo no tiene forma de decirlo.

`vision.md` §17 define el éxito como "la experiencia correspondiente funciona de verdad". Sin nada que la observe, esa definición no se puede comprobar.

---

## 5. El recorrido propuesto

Los principios, en orden de importancia:

1. **Una sola fuente de verdad del progreso, persistente.** La URL solo enlaza; nunca es estado.
2. **Toda lección se cierra con un cierre visible**, aunque haya más por hacer.
3. **Todo paso tiene salida.** Escribir es práctica, no una puerta.
4. **El bloqueo se explica.** "Se desbloquea al completar las vocales" es mejor que diez filas mudas.
5. **El contenido viene del contenido.** Opciones, glifos, pistas y textos viajan con el carácter.
6. **Prometer solo lo que existe.** Si か no está, la ruta no dice "el próximo grupo será la Fila K".

```
APERTURA
  Sin progreso  →  Bienvenida (EMPEZAR), como ahora
  Con progreso  →  Inicio: "Continúa · う · 3 de 5"  +  "Repetir え"
                    →  Acceso a la ruta completa
        ↓
RUTA  /learn/japanese/hiragana
  Grupo Vocales:  あ ✓   い ✓   う ●   え ○   お ○
                   un solo objetivo visible, un solo número "3 de 5"
  Filas bloqueadas: botón deshabilitado real, con motivo:
                   "Se desbloquea al completar las vocales"
  Sin "5 de 5" repetido en seis sitios
        ↓
LECCIÓN DE CARÁCTER  — 4 pasos visibles, 4 salidas
  1  Observa     símbolo + sonido + significado   (nunca se oculta)
  2  Practica    escribir · "Saltar escritura" siempre visible
                 los trazos se conservan al cambiar de paso
                 contador de intentos · tras N fallos, vuelve a la demo
  3  Reconoce    opciones del grupo, distractores reales
                 feedback por opción
  4  Cierre      SIEMPRE: "Has escrito あ · 3 trazos · 2 intentos"
                 + el siguiente objetivo real
        ↓
SIGUIENTE OBJETIVO  —  el que exista, no una promesa
```

Diferencias medibles frente al recorrido actual:

| | Hoy | Propuesto |
| --- | --- | --- |
| Cerrar la app y volver | 0 de 5 | 3 de 5, en la pantalla de inicio |
| Recargar en web | se pierde lo no parametrizado | nada se pierde |
| Fallar 20 trazos | lienzo naranja ilegible | contador + sugerencia de demostración |
| Usuario con lector de pantalla | bloqueado en el paso 2 | ruta no visual disponible |
| Texto del sistema al 200% | se ignora | se respeta |
| Terminar お | promesa de Fila K inexistente | か, o "próximamente" honesto |
| Terminar あ | nada visible | cierre con trazos e intentos |

---

## 6. Riesgos de arquitectura que revela la UX

- **El progreso no persistente no es solo un bug.** Es la ausencia del modelo `Progress` del que dependen la fase 4 (vocabulario) y la fase 6 (repaso) del roadmap, y las secciones §10 y §11 de la visión. Debe construirse como dominio, no como parámetro.
- **`KanaCharacterLesson` es un monolito de 389 líneas** con un `StyleSheet` de más de 100 entradas. Las cuatro fases, el estado de dibujo, los booleanos de responsiva y el JSX están entrelazados. Añadir un tipo de ejercicio (§7 de la visión) o un paso más implica reescribirlo, no extenderlo.
- **`nextCharacter` mezcla navegación con contenido.** `kana-character-lesson.tsx:22` — cada ruta declara a mano a dónde va. Con 46 hiragana son 46 declaraciones manuales que se desincronizan del contenido.
- **Las reglas de progresión no son testeables** porque están en el componente (A-23). La estructura correcta ya está probada en `domain/`: replicarla.
- **Los breakpoints y los patrones de botón son código duplicado**, no decisiones de diseño. Cada pantalla nuevaagravará la inconsistencia.

---

## 7. Qué no verifiqué

- **No ejecuté la aplicación.** No hay dispositivo, emulador ni navegador disponible en esta sesión. Todos los hallazgos provienen de lectura de código y de `lint`, `tsc --noEmit` y `npm test`. Las "reproducciones" describen la ruta de código exacta y **deben confirmarse en el dispositivo** antes de cerrar cada corrección.
- **No probé TalkBack, VoiceOver ni escalado de texto real.** Los hallazgos A-03, A-11 y A-17 provienen de leer el código, no de observar la TalkBack.
- **No medí el rendimiento del lienzo con trazos reales.** En A-16 calculé la conversión de umbrales a píxeles de forma analítica; conviene verificar con trazos de dedos reales.
- **No validé el diseño visual** contra la intención de marca: sin renderizado no puedo juzgar jerarquía, contraste o equilibrio. Los judgments de A-11, A-20 y A-21 son sobre el código, no sobre la pantalla.
- **`docs/architecture.md` está vacío** (0 bytes), así que no pude contrastar estos hallazgos contra una arquitectura documentada.
- **No hay usuarios reales ni métricas**, porque no hay telemetría (A-25). Cualquier afirmación sobre si el recorrido "funciona" es hoy una hipótesis.
