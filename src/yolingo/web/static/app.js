const languageList = document.querySelector("#language-list");
const emptyState = document.querySelector("#empty-state");
const languageForm = document.querySelector("#language-form");
const formMessage = document.querySelector("#form-message");
const selection = document.querySelector("#selection");
const categoryLibrary = document.querySelector("#category-library");
const categoryForm = document.querySelector("#category-form");
const categoryFormMessage = document.querySelector("#category-form-message");
const categoryStatus = document.querySelector("#category-status");
const categoryLoading = document.querySelector("#category-loading");
const categoryEmpty = document.querySelector("#category-empty");
const categoryContent = document.querySelector("#category-content");
const categoryTree = document.querySelector("#category-tree");
const categoryContext = document.querySelector(".category-context");
const flashcardForm = document.querySelector("#flashcard-form");
const flashcardFormMessage = document.querySelector("#flashcard-form-message");
const flashcardStatus = document.querySelector("#flashcard-status");
const flashcardLoading = document.querySelector("#flashcard-loading");
const flashcardEmpty = document.querySelector("#flashcard-empty");
const flashcardList = document.querySelector("#flashcard-list");
const flashcardSearch = document.querySelector("#flashcard-search");
const showFlashcardFormButton = document.querySelector("#show-flashcard-form-button");

let languages = [];
let selectedLanguage = null;
let categories = [];
let selectedCategoryId = null;
let categoryFormParentId = null;
let flashcards = [];
let editingFlashcardId = null;
let activeFlashcardCategoryId = null;
let flashcardLoadVersion = 0;

function showForm() {
  languageForm.hidden = false;
  formMessage.textContent = "";
  languageForm.elements.name.focus();
}

function hideForm() {
  languageForm.hidden = true;
  languageForm.reset();
  formMessage.textContent = "";
}

function selectLanguage(language) {
  selectedLanguage = language;
  categories = [];
  selectedCategoryId = Number(
    localStorage.getItem(`yolingo:selected-category:${language.id}`),
  ) || null;
  localStorage.setItem("yolingo:selected-language", String(language.id));
  document.querySelector("#selection-name").textContent = language.name;
  document.querySelector("#selection-flag").textContent = language.flag || "🌍";
  selection.hidden = false;
  categoryLibrary.hidden = false;
  hideCategoryForm();
  resetFlashcardView();

  document.querySelectorAll(".language-card").forEach((card) => {
    card.setAttribute("aria-pressed", String(Number(card.dataset.id) === language.id));
  });
  loadCategories(language.id);
  selection.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function createLanguageCard(language) {
  const card = document.createElement("button");
  card.className = "language-card";
  card.type = "button";
  card.dataset.id = language.id;
  card.setAttribute("aria-pressed", "false");

  const flag = document.createElement("span");
  flag.className = "card-flag";
  flag.setAttribute("aria-hidden", "true");
  flag.textContent = language.flag || "🌍";

  const content = document.createElement("span");
  content.className = "card-content";

  const name = document.createElement("span");
  name.className = "card-name";
  name.textContent = language.name;

  const code = document.createElement("span");
  code.className = "card-code";
  code.textContent = language.code;

  const action = document.createElement("span");
  action.className = "card-action";
  action.textContent = "Abrir biblioteca →";

  content.append(name, code, action);
  card.append(flag, content);
  card.addEventListener("click", () => selectLanguage(language));
  return card;
}

function renderLanguages() {
  languageList.replaceChildren(...languages.map(createLanguageCard));
  emptyState.hidden = languages.length > 0;

  const selectedId = Number(localStorage.getItem("yolingo:selected-language"));
  const storedLanguage = languages.find((language) => language.id === selectedId);
  if (storedLanguage) {
    selectLanguage(storedLanguage);
  } else {
    selectedLanguage = null;
    selection.hidden = true;
    categoryLibrary.hidden = true;
  }
}

function showCategoryForm(parent = null) {
  categoryFormParentId = parent?.id ?? null;
  document.querySelector("#category-form-title").textContent = parent
    ? "Añade una subcategoría"
    : "Añade una categoría";
  document.querySelector("#category-form-hint").textContent = parent
    ? `Se creará dentro de ${parent.name}.`
    : "Crea un grupo para organizar tu vocabulario.";
  categoryForm.elements.name.placeholder = parent ? "Greetings" : "Everyday";
  categoryFormMessage.textContent = "";
  categoryForm.hidden = false;
  categoryForm.elements.name.focus();
}

function hideCategoryForm() {
  categoryForm.hidden = true;
  categoryForm.reset();
  categoryFormMessage.textContent = "";
  categoryFormParentId = null;
}

function createCategoryAction(label, symbol, className, handler) {
  const button = document.createElement("button");
  button.className = `category-action ${className}`;
  button.type = "button";
  button.setAttribute("aria-label", label);
  button.title = label;
  button.textContent = symbol;
  button.addEventListener("click", handler);
  return button;
}

function createCategoryRow(category, isChild = false) {
  const row = document.createElement("div");
  row.className = `category-row ${isChild ? "category-row-child" : "category-row-root"}`;
  row.dataset.categoryId = category.id;

  const selectButton = document.createElement("button");
  selectButton.className = "category-select";
  selectButton.type = "button";
  selectButton.textContent = category.name;
  selectButton.setAttribute("aria-current", String(category.id === selectedCategoryId));
  selectButton.addEventListener("click", () => selectCategory(category));
  row.append(selectButton);

  if (!isChild) {
    row.append(
      createCategoryAction(
        `Crear subcategoría dentro de ${category.name}`,
        "+",
        "category-add-child",
        () => showCategoryForm(category),
      ),
    );
  }

  row.append(
    createCategoryAction(
      `Eliminar ${category.name}`,
      "×",
      "category-delete",
      () => deleteCategory(category),
    ),
  );
  return row;
}

function createCategoryGroup(root) {
  const group = document.createElement("div");
  group.className = "category-group";
  group.append(createCategoryRow(root));
  categories
    .filter((category) => category.parent_id === root.id)
    .forEach((child) => group.append(createCategoryRow(child, true)));
  return group;
}

function updateCategorySelection() {
  const category = categories.find((item) => item.id === selectedCategoryId);
  document.querySelectorAll(".category-row").forEach((row) => {
    const button = row.querySelector(".category-select");
    button.setAttribute(
      "aria-current",
      String(Number(row.dataset.categoryId) === selectedCategoryId),
    );
  });
  document.querySelector("#category-placeholder").hidden = Boolean(category);
  document.querySelector("#selected-category").hidden = !category;
  document.querySelector("#selected-category-name").textContent = category?.name || "";
  categoryContext.classList.toggle("has-selection", Boolean(category));
  return category;
}

function selectCategory(category) {
  selectedCategoryId = category.id;
  localStorage.setItem(
    `yolingo:selected-category:${selectedLanguage.id}`,
    String(category.id),
  );
  updateCategorySelection();
  loadFlashcards(category.id);
}

function renderCategories() {
  if (!categories.some((category) => category.id === selectedCategoryId)) {
    if (selectedCategoryId !== null) {
      localStorage.removeItem(`yolingo:selected-category:${selectedLanguage.id}`);
    }
    selectedCategoryId = null;
  }

  const roots = categories.filter((category) => category.parent_id === null);
  categoryTree.replaceChildren(...roots.map(createCategoryGroup));
  categoryEmpty.hidden = roots.length > 0;
  categoryContent.hidden = roots.length === 0;
  const selectedCategory = updateCategorySelection();
  if (selectedCategory) {
    loadFlashcards(selectedCategory.id);
  } else {
    resetFlashcardView();
  }
}

async function loadCategories(languageId) {
  categoryLibrary.setAttribute("aria-busy", "true");
  categoryLoading.hidden = false;
  categoryEmpty.hidden = true;
  categoryContent.hidden = true;
  categoryStatus.textContent = "";

  try {
    const response = await fetch(`/api/v1/languages/${languageId}/categories`);
    if (!response.ok) throw new Error("No se pudieron cargar las categorías.");
    const loadedCategories = await response.json();
    if (selectedLanguage?.id !== languageId) return;
    categories = loadedCategories;
    renderCategories();
  } catch (error) {
    if (selectedLanguage?.id === languageId) {
      categoryStatus.textContent = error.message;
    }
  } finally {
    if (selectedLanguage?.id === languageId) {
      categoryLoading.hidden = true;
      categoryLibrary.setAttribute("aria-busy", "false");
    }
  }
}

async function responseError(response, fallback) {
  try {
    const body = await response.json();
    return typeof body.detail === "string" ? body.detail : fallback;
  } catch {
    return fallback;
  }
}

async function submitCategory(event) {
  event.preventDefault();
  categoryFormMessage.textContent = "";
  const submitButton = categoryForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  const languageId = selectedLanguage.id;
  const payload = {
    name: new FormData(categoryForm).get("name"),
    parent_id: categoryFormParentId,
  };

  try {
    const response = await fetch(`/api/v1/languages/${languageId}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(await responseError(response, "No se pudo crear la categoría."));
    }

    const category = await response.json();
    if (selectedLanguage?.id !== languageId) return;
    categories.push(category);
    categories.sort((first, second) => first.name.localeCompare(second.name));
    hideCategoryForm();
    selectedCategoryId = category.id;
    localStorage.setItem(`yolingo:selected-category:${languageId}`, String(category.id));
    renderCategories();
    categoryStatus.textContent = `${category.name} se ha creado correctamente.`;
  } catch (error) {
    categoryFormMessage.textContent = error.message;
  } finally {
    submitButton.disabled = false;
  }
}

async function deleteCategory(category) {
  const hasChildren = categories.some((item) => item.parent_id === category.id);
  const warning = hasChildren
    ? `¿Eliminar ${category.name} y todas sus subcategorías?`
    : `¿Eliminar ${category.name}?`;
  if (!window.confirm(warning)) return;

  const languageId = selectedLanguage.id;
  categoryStatus.textContent = `Eliminando ${category.name}…`;
  try {
    const response = await fetch(
      `/api/v1/languages/${languageId}/categories/${category.id}`,
      { method: "DELETE" },
    );
    if (!response.ok) {
      throw new Error(await responseError(response, "No se pudo eliminar la categoría."));
    }
    if (selectedLanguage?.id !== languageId) return;

    const removedIds = new Set([
      category.id,
      ...categories
        .filter((item) => item.parent_id === category.id)
        .map((item) => item.id),
    ]);
    categories = categories.filter((item) => !removedIds.has(item.id));
    if (removedIds.has(selectedCategoryId)) {
      selectedCategoryId = null;
      localStorage.removeItem(`yolingo:selected-category:${languageId}`);
    }
    renderCategories();
    categoryStatus.textContent = `${category.name} se ha eliminado.`;
  } catch (error) {
    categoryStatus.textContent = error.message;
  }
}

function resetFlashcardView() {
  flashcardLoadVersion += 1;
  flashcards = [];
  activeFlashcardCategoryId = null;
  flashcardSearch.value = "";
  flashcardStatus.textContent = "";
  flashcardLoading.hidden = true;
  flashcardEmpty.hidden = true;
  flashcardList.replaceChildren();
  categoryContext.setAttribute("aria-busy", "false");
  showFlashcardFormButton.disabled = false;
  flashcardSearch.disabled = false;
  hideFlashcardForm();
}

function showFlashcardForm(flashcard = null) {
  editingFlashcardId = flashcard?.id ?? null;
  flashcardForm.reset();
  flashcardFormMessage.textContent = "";
  document.querySelector("#flashcard-form-title").textContent = flashcard
    ? "Editar flashcard"
    : "Nueva flashcard";
  if (flashcard) {
    flashcardForm.elements.term.value = flashcard.term;
    flashcardForm.elements.translation.value = flashcard.translation;
    flashcardForm.elements.example.value = flashcard.example || "";
    flashcardForm.elements.notes.value = flashcard.notes || "";
  }
  flashcardForm.hidden = false;
  flashcardForm.elements.term.focus();
}

function hideFlashcardForm() {
  flashcardForm.hidden = true;
  flashcardForm.reset();
  flashcardFormMessage.textContent = "";
  editingFlashcardId = null;
}

function createFlashcardDetail(label, value) {
  const detail = document.createElement("p");
  detail.className = "flashcard-detail";
  const heading = document.createElement("strong");
  heading.textContent = `${label}: `;
  detail.append(heading, document.createTextNode(value));
  return detail;
}

function createFlashcardItem(flashcard) {
  const item = document.createElement("article");
  item.className = "flashcard-item";
  item.dataset.flashcardId = flashcard.id;
  item.tabIndex = -1;
  item.setAttribute("aria-label", `Flashcard: ${flashcard.term}, ${flashcard.translation}`);

  const term = document.createElement("p");
  term.className = "flashcard-term";
  term.textContent = flashcard.term;
  const translation = document.createElement("p");
  translation.className = "flashcard-translation";
  translation.textContent = flashcard.translation;
  item.append(term, translation);

  if (flashcard.example) {
    item.append(createFlashcardDetail("Ejemplo", flashcard.example));
  }
  if (flashcard.notes) {
    item.append(createFlashcardDetail("Notas", flashcard.notes));
  }

  const actions = document.createElement("div");
  actions.className = "flashcard-item-actions";
  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.textContent = "Editar";
  editButton.setAttribute("aria-label", `Editar ${flashcard.term}`);
  editButton.addEventListener("click", () => showFlashcardForm(flashcard));
  const deleteButton = document.createElement("button");
  deleteButton.className = "flashcard-delete";
  deleteButton.type = "button";
  deleteButton.textContent = "Eliminar";
  deleteButton.setAttribute("aria-label", `Eliminar ${flashcard.term}`);
  deleteButton.addEventListener("click", () => deleteFlashcard(flashcard, deleteButton));
  actions.append(editButton, deleteButton);
  item.append(actions);
  return item;
}

function renderFlashcards() {
  const query = flashcardSearch.value.trim().toLocaleLowerCase();
  const visibleFlashcards = flashcards.filter((flashcard) => (
    flashcard.term.toLocaleLowerCase().includes(query)
    || flashcard.translation.toLocaleLowerCase().includes(query)
  ));
  flashcardList.replaceChildren(...visibleFlashcards.map(createFlashcardItem));
  flashcardEmpty.hidden = visibleFlashcards.length > 0;

  const emptyTitle = document.querySelector("#flashcard-empty-title");
  const emptyCopy = document.querySelector("#flashcard-empty-copy");
  if (query && visibleFlashcards.length === 0) {
    emptyTitle.textContent = "No hay resultados";
    emptyCopy.textContent = "Prueba con otro término o traducción.";
  } else {
    emptyTitle.textContent = "Aún no hay flashcards";
    emptyCopy.textContent = "Crea la primera para comenzar tu vocabulario.";
  }
}

async function loadFlashcards(categoryId) {
  resetFlashcardView();
  const loadVersion = flashcardLoadVersion;
  activeFlashcardCategoryId = categoryId;
  const languageId = selectedLanguage.id;
  categoryContext.setAttribute("aria-busy", "true");
  flashcardLoading.hidden = false;
  showFlashcardFormButton.disabled = true;
  flashcardSearch.disabled = true;

  try {
    const response = await fetch(
      `/api/v1/languages/${languageId}/categories/${categoryId}/flashcards`,
    );
    if (!response.ok) throw new Error("No se pudieron cargar las flashcards.");
    const loadedFlashcards = await response.json();
    if (
      selectedLanguage?.id !== languageId
      || selectedCategoryId !== categoryId
      || activeFlashcardCategoryId !== categoryId
      || flashcardLoadVersion !== loadVersion
    ) return;
    flashcards = loadedFlashcards;
    renderFlashcards();
  } catch (error) {
    if (
      selectedLanguage?.id === languageId
      && selectedCategoryId === categoryId
      && flashcardLoadVersion === loadVersion
    ) {
      flashcardStatus.textContent = error.message;
    }
  } finally {
    if (
      selectedLanguage?.id === languageId
      && selectedCategoryId === categoryId
      && flashcardLoadVersion === loadVersion
    ) {
      flashcardLoading.hidden = true;
      categoryContext.setAttribute("aria-busy", "false");
      showFlashcardFormButton.disabled = false;
      flashcardSearch.disabled = false;
    }
  }
}

async function submitFlashcard(event) {
  event.preventDefault();
  flashcardFormMessage.textContent = "";
  const submitButton = flashcardForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  const languageId = selectedLanguage.id;
  const categoryId = selectedCategoryId;
  const flashcardId = editingFlashcardId;
  const data = new FormData(flashcardForm);
  const payload = {
    term: data.get("term"),
    translation: data.get("translation"),
    example: data.get("example") || null,
    notes: data.get("notes") || null,
  };
  const path = flashcardId
    ? `/api/v1/flashcards/${flashcardId}`
    : `/api/v1/languages/${languageId}/categories/${categoryId}/flashcards`;

  try {
    const response = await fetch(path, {
      method: flashcardId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(await responseError(response, "No se pudo guardar la flashcard."));
    }
    const saved = await response.json();
    if (selectedLanguage?.id !== languageId || selectedCategoryId !== categoryId) return;

    if (flashcardId) {
      flashcards = flashcards.map((flashcard) => (
        flashcard.id === saved.id ? saved : flashcard
      ));
    } else {
      flashcards.push(saved);
    }
    flashcards.sort((first, second) => first.term.localeCompare(second.term));
    hideFlashcardForm();
    renderFlashcards();
    flashcardStatus.textContent = flashcardId
      ? `${saved.term} se ha actualizado.`
      : `${saved.term} se ha creado correctamente.`;
    document.querySelector(`[data-flashcard-id="${saved.id}"]`)?.focus();
  } catch (error) {
    flashcardFormMessage.textContent = error.message;
  } finally {
    submitButton.disabled = false;
  }
}

async function deleteFlashcard(flashcard, deleteButton) {
  if (!window.confirm(`¿Eliminar ${flashcard.term}?`)) return;

  deleteButton.disabled = true;
  const languageId = selectedLanguage.id;
  const categoryId = selectedCategoryId;
  flashcardStatus.textContent = `Eliminando ${flashcard.term}…`;
  try {
    const response = await fetch(`/api/v1/flashcards/${flashcard.id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(await responseError(response, "No se pudo eliminar la flashcard."));
    }
    if (selectedLanguage?.id !== languageId || selectedCategoryId !== categoryId) return;
    flashcards = flashcards.filter((item) => item.id !== flashcard.id);
    if (editingFlashcardId === flashcard.id) hideFlashcardForm();
    renderFlashcards();
    flashcardStatus.textContent = `${flashcard.term} se ha eliminado.`;
    showFlashcardFormButton.focus();
  } catch (error) {
    flashcardStatus.textContent = error.message;
  } finally {
    deleteButton.disabled = false;
  }
}

async function loadLanguages() {
  try {
    const response = await fetch("/api/v1/languages");
    if (!response.ok) throw new Error("No se pudo cargar la biblioteca.");
    languages = await response.json();
    renderLanguages();
  } catch {
    languageList.innerHTML = '<p class="form-message">No se pudo cargar tu biblioteca.</p>';
  }
}

async function submitLanguage(event) {
  event.preventDefault();
  formMessage.textContent = "";
  const data = new FormData(languageForm);
  const payload = {
    name: data.get("name"),
    code: data.get("code"),
    flag: data.get("flag") || null,
  };

  try {
    const response = await fetch("/api/v1/languages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const body = await response.json();
      throw new Error(response.status === 409 ? body.detail : "Revisa los datos introducidos.");
    }

    const language = await response.json();
    languages.push(language);
    languages.sort((first, second) => first.name.localeCompare(second.name));
    hideForm();
    localStorage.setItem("yolingo:selected-language", String(language.id));
    renderLanguages();
  } catch (error) {
    formMessage.textContent = error.message;
  }
}

document.querySelector("#show-form-button").addEventListener("click", showForm);
document.querySelector("#empty-action").addEventListener("click", showForm);
document.querySelector("#close-form-button").addEventListener("click", hideForm);
document.querySelector("#show-category-form-button").addEventListener("click", () => {
  showCategoryForm();
});
document.querySelector("#category-empty-action").addEventListener("click", () => {
  showCategoryForm();
});
document.querySelector("#close-category-form-button").addEventListener("click", hideCategoryForm);
showFlashcardFormButton.addEventListener("click", () => {
  showFlashcardForm();
});
document.querySelector("#close-flashcard-form-button").addEventListener("click", hideFlashcardForm);
document.querySelector("#cancel-flashcard-form-button").addEventListener("click", hideFlashcardForm);
languageForm.addEventListener("submit", submitLanguage);
categoryForm.addEventListener("submit", submitCategory);
flashcardForm.addEventListener("submit", submitFlashcard);
flashcardSearch.addEventListener("input", renderFlashcards);

loadLanguages();
