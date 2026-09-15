import asyncio

import httpx2
from fastapi import FastAPI


def test_home_page_is_available(app: FastAPI) -> None:
    response = asyncio.run(get_response(app, "/"))

    assert response.status_code == httpx2.codes.OK
    assert "¿Qué idioma quieres practicar?" in response.text
    assert "Mis idiomas" in response.text
    assert "Añadir idioma" in response.text
    assert "Categorías" in response.text
    assert "Selecciona una categoría" in response.text
    assert "Nueva flashcard" in response.text
    assert "Buscar por término o traducción" in response.text
    assert "Filtrar por tags" in response.text
    assert "Nuevo tag" in response.text
    assert "Filtros activos:" in response.text
    assert "Reintentar carga de tags" in response.text
    assert '<script src="/static/study-session.js" defer></script>' in response.text
    assert "Modo estudio" in response.text
    assert "Revelar respuesta" in response.text
    assert '<span aria-hidden="true">←</span> Salir' in response.text
    assert "Sesión completada" in response.text
    assert "No hay flashcards para estudiar." in response.text
    assert "Cargando tus idiomas…" in response.text
    assert "No pudimos cargar tus idiomas" in response.text
    assert "No pudimos cargar las categorías" in response.text
    assert 'id="retry-languages-button"' in response.text
    assert 'id="retry-categories-button"' in response.text
    assert 'class="skip-link" href="#main-content"' in response.text
    assert '<main id="main-content" tabindex="-1">' in response.text
    assert 'aria-label="Cerrar formulario de idioma"' in response.text
    assert 'aria-label="Cerrar formulario de categoría"' in response.text
    assert 'aria-label="Cerrar formulario de flashcard"' in response.text
    assert 'aria-describedby="tag-form-message"' in response.text
    assert 'aria-describedby="flashcard-form-message"' in response.text
    assert 'class="app-navigation" aria-label="Navegación principal"' in response.text
    assert 'id="nav-home-button"' in response.text
    assert 'id="nav-library-button"' in response.text
    assert 'id="nav-study-button"' in response.text
    assert 'id="header-language-button"' in response.text
    assert 'id="mobile-category-back"' in response.text
    assert 'class="filter-panel" id="filter-panel"' in response.text
    assert 'id="filter-panel-hint"' in response.text


def test_study_session_client_is_available(app: FastAPI) -> None:
    response = asyncio.run(get_response(app, "/static/study-session.js"))

    assert response.status_code == httpx2.codes.OK
    assert "class StudySession" in response.text
    assert "revealAnswer" in response.text
    assert "restart" in response.text


def test_category_client_is_available(app: FastAPI) -> None:
    response = asyncio.run(get_response(app, "/static/app.js"))

    assert response.status_code == httpx2.codes.OK
    assert "loadCategories" in response.text
    assert "loadFlashcards" in response.text
    assert "loadTags" in response.text
    assert "URLSearchParams" in response.text
    assert 'query.append("tag_ids", tagId)' in response.text
    assert '`/api/v1/flashcards/${saved.id}/tags`' in response.text
    assert "renderLibraryContext" in response.text
    assert "activeFlashcardCategoryId !== categoryId" in response.text
    assert 'method: "POST"' in response.text
    assert 'method: "PUT"' in response.text
    assert '"PATCH"' in response.text
    assert 'method: "DELETE"' in response.text
    assert "startStudy" in response.text
    assert "renderStudySession" in response.text
    assert "/study-flashcards" in response.text
    assert "studySession.restart()" in response.text
    assert "new AbortController()" in response.text
    assert "currentFlashcardQuery() !== queryString" in response.text
    assert "response.status >= 500" in response.text
    assert "No hay flashcards con todos esos tags" in response.text
    assert "No hay coincidencias para" in response.text
    assert "Has abandonado la sesión de estudio." in response.text
    assert 'submitButton.textContent = "Guardando…"' in response.text
    assert "showFormError" in response.text
    assert 'setAttribute("aria-invalid", "true")' in response.text
    assert "fields[0]?.focus()" in response.text
    assert "function restoreFocus" in response.text
    assert "categoryFormReturnFocus" in response.text
    assert "flashcardFormReturnFocus" in response.text
    assert "restoreFocus(flashcardFormReturnFocus, showFlashcardFormButton)" in response.text
    assert "toggleButton.dataset.tagId = tag.id" in response.text
    assert "else if (!categoryForm.hidden)" in response.text
    assert "else if (!languageForm.hidden)" in response.text
    assert "function showHomeView()" in response.text
    assert "function showLibraryView()" in response.text
    assert "function updateAppShell()" in response.text
    assert "Idioma activo" in response.text
    assert "showLanguageFormButton.hidden = languages.length === 0" in response.text
    assert "function showCategoryList()" in response.text
    assert "function createActionMenu" in response.text
    assert 'actions.classList.add("flashcard-item-actions")' in response.text
    assert 'filterPanelHint.textContent = hasFilters ? "Activos" : "Ajustar"' in response.text
    assert 'document.body.classList.add("study-mode-active")' in response.text
    assert 'document.body.classList.remove("study-mode-active")' in response.text
    assert 'isCompleted ? `${total} / ${total}` : ""' in response.text
    assert 'total === 1 ? "palabra estudiada" : "palabras estudiadas"' in response.text
    assert "navStudyButton.addEventListener(\"click\", startStudy)" in response.text


def test_responsive_and_focus_styles_are_available(app: FastAPI) -> None:
    response = asyncio.run(get_response(app, "/static/styles.css"))

    assert response.status_code == httpx2.codes.OK
    assert ".skip-link:focus" in response.text
    assert 'input[aria-invalid="true"]' in response.text
    assert "@media (max-width: 860px)" in response.text
    assert "@media (max-width: 680px)" in response.text
    assert "outline: 3px solid var(--coral)" in response.text
    assert ".button:active:not(:disabled)" in response.text
    assert ".button-secondary:hover" in response.text
    assert ".form-message:not(:empty)" in response.text
    assert "color: var(--danger)" in response.text
    assert ".app-navigation" in response.text
    assert "env(safe-area-inset-bottom)" in response.text
    assert '.app-navigation-item[aria-current="page"]' in response.text
    assert ".language-add-action" in response.text
    assert '.language-card[aria-pressed="true"]' in response.text
    assert ".category-layout:not(.showing-category) .category-context" in response.text
    assert ".category-layout.showing-category .category-navigation" in response.text
    assert ".item-actions-popover" in response.text
    assert ".filter-panel" in response.text
    assert "body.study-mode-active .app-navigation" in response.text
    assert "min-height: 100dvh" in response.text
    assert ".study-card-actions .button" in response.text
    assert "#study-active[hidden]" in response.text


async def get_response(app: FastAPI, path: str) -> httpx2.Response:
    transport = httpx2.ASGITransport(app=app)
    async with httpx2.AsyncClient(transport=transport, base_url="http://testserver") as client:
        return await client.get(path)
