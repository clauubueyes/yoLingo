# MVP de yoLingo

## Resultado que debe conseguir el usuario

El MVP permite crear una biblioteca personal de vocabulario y recorrer un ciclo completo:

1. Abrir yoLingo y crear o seleccionar un idioma.
2. Organizar ese idioma mediante categorías y subcategorías.
3. Crear flashcards y asignarlas a una categoría y a varios tags.
4. Navegar y filtrar la biblioteca por categoría, subcategoría, tag o texto.
5. Iniciar una sesión de estudio con las tarjetas filtradas.
6. Revelar la respuesta y avanzar hasta terminar la sesión.

El criterio de éxito no es disponer de una API completa, sino poder realizar este recorrido desde la interfaz sin herramientas externas.

## Pantallas e interacciones mínimas

### 1. Inicio y selector de idioma

- Lista los idiomas existentes con un resumen de su biblioteca.
- Permite crear un idioma indicando nombre, código y, opcionalmente, bandera.
- Permite seleccionar un idioma para entrar en su biblioteca.
- Ofrece estados vacíos y mensajes de error comprensibles.

### 2. Biblioteca del idioma

- Muestra categorías y subcategorías en una navegación lateral.
- Lista las flashcards del filtro actual.
- Permite crear, editar y eliminar categorías y flashcards.
- Permite añadir y quitar tags durante la edición de una flashcard.
- Permite buscar por término o traducción y filtrar por tags.
- Permite iniciar el estudio con el conjunto visible.

### 3. Estudio

- Muestra una tarjeta cada vez, primero el término y después la respuesta.
- Permite revelar traducción, ejemplo y notas.
- Permite avanzar y muestra el progreso dentro de la sesión.
- Permite terminar o reiniciar la sesión.

La primera versión de estudio no calcula repetición espaciada ni guarda calificaciones. La sesión vive en el navegador y utiliza una selección barajada de las flashcards existentes.

## Modelo mínimo

### Language

- `id`
- `name`
- `code`
- `flag` opcional
- fechas de creación y modificación

Un idioma contiene categorías, flashcards y tags.

### Category

- `id`
- `language_id`
- `parent_id` opcional
- `name`
- fechas de creación y modificación

Una categoría sin `parent_id` es una categoría raíz. Una con `parent_id` es una subcategoría. En el MVP solo habrá dos niveles.

### Flashcard

- `id`
- `language_id`
- `category_id`
- `term`
- `translation`
- `example` opcional
- `notes` opcional
- fechas de creación y modificación

Cada flashcard pertenece a un idioma y a una categoría concreta.

### Tag

- `id`
- `language_id`
- `name`

Una flashcard puede tener varios tags y un tag puede aparecer en varias flashcards. Esta relación necesita una tabla intermedia `flashcard_tags`.

### Relaciones

```text
Language 1 ── * Category
Language 1 ── * Flashcard
Language 1 ── * Tag
Category 1 ── * Category (máximo un nivel de subcategorías)
Category 1 ── * Flashcard
Flashcard * ── * Tag
```

Una sesión básica de estudio no es todavía una entidad persistente. Se añadirá cuando el producto necesite historial, estadísticas o repetición espaciada.

## Fuera del MVP

- Registro, autenticación, perfiles y bibliotecas compartidas.
- Sincronización entre dispositivos.
- Importación y análisis de PDFs o apuntes.
- Generación automática mediante IA.
- Audio, pronunciación y reconocimiento de voz.
- Repetición espaciada, rachas, puntuaciones y estadísticas históricas.
- Aplicación móvil nativa.
- PostgreSQL, Docker, despliegue automatizado y microservicios.

Estas exclusiones no impiden preparar datos fáciles de migrar, pero no justifican componentes anticipados.

## Orden de entrega

Cada incremento debe terminar en una mejora visible y utilizable:

1. Crear y seleccionar idiomas desde la interfaz.
2. Navegar y crear categorías y subcategorías.
3. Crear, consultar y editar flashcards dentro de una categoría.
4. Añadir tags, búsqueda y filtros.
5. Completar una sesión sencilla de estudio.
6. Pulir experiencia, accesibilidad y presentación pública del MVP.
