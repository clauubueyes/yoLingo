# yoLingo

yoLingo es una aplicación web para crear una biblioteca personal de vocabulario y
estudiarla mediante sesiones de flashcards. La interfaz permite completar el flujo entero
desde el navegador, sin herramientas externas.

## Qué permite hacer

- Crear y seleccionar bibliotecas por idioma.
- Organizar vocabulario en categorías y subcategorías.
- Crear, editar y eliminar flashcards con ejemplos y notas opcionales.
- Crear tags y asociar varios a una flashcard.
- Buscar por término o traducción y combinar filtros por tags.
- Estudiar las tarjetas filtradas, revelar sus respuestas y completar o reiniciar la sesión.

## Stack

- Python 3.12.
- FastAPI y Pydantic para la API HTTP.
- SQLAlchemy 2 y Alembic para persistencia y migraciones.
- SQLite como base de datos del MVP.
- HTML, CSS y JavaScript sin framework para la interfaz.
- pytest, httpx2 y las pruebas nativas de Node.js para validación.
- Ruff para análisis estático y formato de imports.

## Arquitectura

yoLingo es un monolito modular por capas. Las dependencias avanzan desde la interfaz
hacia la persistencia:

```text
Frontend
    ↓
API HTTP
    ↓
Services
    ↓
Repositories
    ↓
SQLAlchemy
    ↓
SQLite
```

Cada funcionalidad se entrega verticalmente a través de esas capas. La descripción
detallada está en [docs/architecture.md](docs/architecture.md).

## Ejecutar el proyecto

### Requisitos

- Python 3.12 o posterior.
- Node.js es opcional y solo se necesita para ejecutar las pruebas de comportamiento
  del modo estudio.

Desde la raíz del repositorio, crea un entorno virtual e instala el proyecto con sus
dependencias de desarrollo.

En Windows con `cmd`:

```bat
python -m venv .venv
.venv\Scripts\activate.bat
python -m pip install -e ".[dev]"
alembic upgrade head
uvicorn yolingo.main:app --reload
```

En macOS o Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -e ".[dev]"
alembic upgrade head
uvicorn yolingo.main:app --reload
```

La interfaz queda disponible en <http://127.0.0.1:8000>. La documentación interactiva
de la API se publica en <http://127.0.0.1:8000/docs> y el estado de la aplicación puede
comprobarse en <http://127.0.0.1:8000/api/v1/health>.

Alembic crea `yolingo.db` la primera vez que se aplican las migraciones. Para usar otra
base de datos, define `YOLINGO_DATABASE_URL` antes de ejecutar Alembic y la aplicación.

## Tests y calidad

Con el entorno virtual activo:

```bat
pytest
ruff check src tests
```

`pytest` incluye las pruebas JavaScript cuando Node.js está disponible. También pueden
ejecutarse directamente:

```bat
node --test tests\javascript\study-session.test.js
```

La suite cubre idiomas, categorías, flashcards, tags, búsqueda y filtros, además de la
selección y el comportamiento de las sesiones de estudio.

## Estado del proyecto

La versión actual es un MVP funcional. Permite recorrer desde la interfaz el flujo de
crear o seleccionar un idioma, organizar categorías, guardar y etiquetar vocabulario,
filtrarlo y completar una sesión de estudio.

Quedan fuera de este MVP, entre otras evoluciones, las cuentas de usuario, la
sincronización, el audio, la importación de documentos, la generación mediante IA y la
repetición espaciada. Consulta [docs/mvp.md](docs/mvp.md) y
[docs/roadmap.md](docs/roadmap.md) para conocer el alcance y las posibles líneas futuras.
