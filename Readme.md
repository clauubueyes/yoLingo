# yoLingo

yoLingo es una aplicación web para crear y estudiar bibliotecas de vocabulario organizadas por idiomas, categorías y subcategorías.

El proyecto está en una fase inicial y se construye mediante incrementos verticales que dejan una interfaz utilizable desde el primer flujo.

## Requisitos

- Python 3.12+

## Puesta en marcha

```bash
python -m venv .venv
.venv\Scripts\activate
python -m pip install -e .[dev]
alembic upgrade head
uvicorn yolingo.main:app --reload
```

La aplicación estará disponible en `http://127.0.0.1:8000` y la documentación interactiva de su API en `http://127.0.0.1:8000/docs`.

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
- [Definición del MVP](docs/mvp.md)
- [Hoja de ruta](docs/roadmap.md)

## Estado

En desarrollo. El flujo disponible permite crear y seleccionar idiomas, organizar su biblioteca
mediante categorías y subcategorías, gestionar flashcards, asignarles varios tags y combinar la
búsqueda por término o traducción con filtros por tags.
