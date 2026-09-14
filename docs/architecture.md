# Arquitectura

## Objetivo

yoLingo comienza como un monolito modular por capas. Esta arquitectura mantiene un despliegue sencillo y separa responsabilidades para que el producto pueda crecer sin introducir microservicios prematuramente.

## Capas

El flujo principal será:

```text
Frontend -> API HTTP -> Servicios -> Repositorios -> SQLAlchemy -> Base de datos
```

- **API HTTP:** valida solicitudes, traduce errores a respuestas HTTP y serializa resultados.
- **Servicios:** contiene los casos de uso y coordina las reglas de negocio.
- **Repositorios:** abstrae la persistencia requerida por los servicios.
- **ORM:** define el mapeo entre entidades persistentes y la base de datos.
- **Base de datos:** SQLite durante la primera etapa; PostgreSQL solo cuando exista una necesidad real.

Las dependencias apuntarán hacia el dominio y los contratos, evitando que la lógica de negocio dependa de FastAPI o de detalles concretos de SQLAlchemy.

## Estructura inicial

```text
src/yolingo/
├── api/
│   └── routes/
└── main.py
tests/
```

Se añadirán módulos únicamente cuando una funcionalidad los necesite. El primer endpoint, `/api/v1/health`, permite verificar que la aplicación arranca y deja establecido el versionado de la API.

## Decisiones vigentes

- Python 3.12 como versión mínima.
- FastAPI y Pydantic para la interfaz HTTP.
- SQLAlchemy 2 y Alembic para persistencia y migraciones.
- Dependencias gestionadas desde `pyproject.toml`.
- Patrón application factory para crear instancias aisladas durante las pruebas.
