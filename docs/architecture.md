# Arquitectura

## Objetivo

yoLingo comienza como un monolito modular por capas. La arquitectura está al servicio del [flujo del MVP](mvp.md): cada funcionalidad se entrega de extremo a extremo, incluida su interfaz, en lugar de completar capas técnicas por separado.

## Capas

El flujo principal será:

```text
Frontend -> API HTTP -> Servicios -> Repositorios -> SQLAlchemy -> Base de datos
```

- **Frontend:** HTML, CSS y JavaScript servidos por la propia aplicación.
- **API HTTP:** valida solicitudes, traduce errores a respuestas HTTP y serializa resultados.
- **Servicios:** contiene los casos de uso y coordina las reglas de negocio.
- **Repositorios:** abstrae la persistencia requerida por los servicios.
- **ORM:** define el mapeo entre entidades persistentes y la base de datos.
- **Base de datos:** SQLite durante la primera etapa; PostgreSQL solo cuando exista una necesidad real.

Las dependencias apuntarán hacia el dominio y los contratos, evitando que la lógica de negocio dependa de FastAPI o de detalles concretos de SQLAlchemy.

## Estructura actual

```text
src/yolingo/
├── api/             # endpoints y dependencias HTTP
├── models/          # mapeos de SQLAlchemy
├── repositories/    # operaciones de persistencia
├── schemas/         # contratos de entrada y salida
├── services/        # casos de uso
├── web/             # interfaz HTML, CSS y JavaScript
├── config.py
├── database.py
└── main.py
migrations/
tests/
```

Se añadirán módulos únicamente cuando una funcionalidad visible los necesite. El endpoint `/api/v1/health` permite verificar que la aplicación arranca y deja establecido el versionado de la API.

## Decisiones vigentes

- Python 3.12 como versión mínima.
- FastAPI y Pydantic para la interfaz HTTP.
- SQLAlchemy 2 y Alembic para persistencia y migraciones.
- Dependencias gestionadas desde `pyproject.toml`.
- Patrón application factory para crear instancias aisladas durante las pruebas.
- Entrega vertical por funcionalidad: interfaz, endpoint, caso de uso y persistencia avanzan juntos.
