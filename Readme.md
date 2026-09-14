# yoLingo

yoLingo es una aplicación web para crear y estudiar bibliotecas de vocabulario organizadas por idiomas, categorías y subcategorías.

El proyecto está en una fase inicial. El primer hito establece una API FastAPI mínima y comprobable sobre la que construiremos el dominio de aprendizaje de forma incremental.

## Requisitos

- Python 3.12+

## Puesta en marcha

```bash
python -m venv .venv
.venv\Scripts\activate
python -m pip install -e .[dev]
uvicorn yolingo.main:app --reload
```

La API estará disponible en `http://127.0.0.1:8000` y su documentación interactiva en `http://127.0.0.1:8000/docs`.

Comprueba su estado con:

```bash
curl http://127.0.0.1:8000/api/v1/health
```

## Calidad

```bash
pytest
ruff check .
```

## Documentación

- [Arquitectura](docs/architecture.md)
- [Hoja de ruta](docs/roadmap.md)

## Estado

En desarrollo. La siguiente entrega introducirá el primer flujo vertical del dominio: creación y consulta de idiomas.
