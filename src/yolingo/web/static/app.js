const languageList = document.querySelector("#language-list");
const emptyState = document.querySelector("#empty-state");
const languageForm = document.querySelector("#language-form");
const formMessage = document.querySelector("#form-message");
const languageLoading = document.querySelector("#language-loading");
const languageLoadError = document.querySelector("#language-load-error");
const selection = document.querySelector("#selection");
const categoryLibrary = document.querySelector("#category-library");
const categoryForm = document.querySelector("#category-form");
const categoryFormMessage = document.querySelector("#category-form-message");
const categoryStatus = document.querySelector("#category-status");
const categoryLoading = document.querySelector("#category-loading");
const categoryLoadError = document.querySelector("#category-load-error");
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
const tagForm = document.querySelector("#tag-form");
const tagFormMessage = document.querySelector("#tag-form-message");
const tagFilterList = document.querySelector("#tag-filter-list");
const tagEmpty = document.querySelector("#tag-empty");
const clearFiltersButton = document.querySelector("#clear-filters-button");
const flashcardTagOptions = document.querySelector("#flashcard-tag-options");
const tagTools = document.querySelector("#tag-tools");
const tagStatus = document.querySelector("#tag-status");
const retryTagsButton = document.querySelector("#retry-tags-button");
const activeFilterSummary = document.querySelector("#active-filter-summary");
const activeFilterDescription = document.querySelector("#active-filter-description");
const flashcardResultsSummary = document.querySelector("#flashcard-results-summary");
const retryFlashcardsButton = document.querySelector("#retry-flashcards-button");
const libraryContextSummary = document.querySelector("#library-context-summary");
const hero = document.querySelector(".hero");
const languageLibrary = document.querySelector(".library");
const startStudyButton = document.querySelector("#start-study-button");
const studyView = document.querySelector("#study-view");
const studyActive = document.querySelector("#study-active");
const studyCard = document.querySelector("#study-card");
const studyAnswer = document.querySelector("#study-answer");
const revealAnswerButton = document.querySelector("#reveal-answer-button");
const nextStudyCardButton = document.querySelector("#next-study-card-button");
const studyEmpty = document.querySelector("#study-empty");
const studyCompleted = document.querySelector("#study-completed");
const showLanguageFormButton = document.querySelector("#show-form-button");
const showCategoryFormButton = document.querySelector("#show-category-form-button");
const showTagFormButton = document.querySelector("#show-tag-form-button");
const filterPanel = document.querySelector("#filter-panel");
const filterPanelHint = document.querySelector("#filter-panel-hint");
const mobileCategoryBack = document.querySelector("#mobile-category-back");
const brandHomeLink = document.querySelector("#brand-home-link");
const headerLanguageButton = document.querySelector("#header-language-button");
const headerLanguageFlag = document.querySelector("#header-language-flag");
const headerLanguageName = document.querySelector("#header-language-name");
const navHomeButton = document.querySelector("#nav-home-button");
const navLibraryButton = document.querySelector("#nav-library-button");
const navStudyButton = document.querySelector("#nav-study-button");

let languages = [];
let selectedLanguage = null;
let categories = [];
let selectedCategoryId = null;
let isCategoryListVisible = true;
let categoryFormParentId = null;
let flashcards = [];
let editingFlashcardId = null;
let activeFlashcardCategoryId = null;
let flashcardLoadVersion = 0;
let availableTags = [];
let selectedFilterTagIds = new Set();
let flashcardSearchTimer = null;
let studySession = null;
let studyLoadController = null;
let languageFormReturnFocus = showLanguageFormButton;
let categoryFormReturnFocus = showCategoryFormButton;
let flashcardFormReturnFocus = showFlashcardFormButton;

function setCurrentNavigation(item) {
  [navHomeButton, navLibraryButton, navStudyButton].forEach((button) => {
    if (button === item) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });
}

function updateAppShell() {
  const hasLanguage = Boolean(selectedLanguage);
  headerLanguageButton.hidden = !hasLanguage;
  headerLanguageFlag.textContent = selectedLanguage?.flag || "🌍";
  headerLanguageName.textContent = selectedLanguage?.name || "";
  navLibraryButton.disabled = !hasLanguage;
  navStudyButton.disabled = !hasLanguage || selectedCategoryId === null;
}

function showHomeView() {
  cancelStudyLoad();
  studySession = null;
  studyView.hidden = true;
  hero.hidden = false;
  languageLibrary.hidden = false;
  selection.hidden = true;
  categoryLibrary.hidden = true;
  setCurrentNavigation(navHomeButton);
  updateAppShell();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showLibraryView() {
  if (!selectedLanguage) return;
  cancelStudyLoad();
  studySession = null;
  studyView.hidden = true;
  hero.hidden = true;
  languageLibrary.hidden = true;
  selection.hidden = false;
  categoryLibrary.hidden = false;
  setCurrentNavigation(navLibraryButton);
  updateAppShell();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function restoreFocus(preferredTarget, fallbackTarget) {
  const target = preferredTarget?.isConnected ? preferredTarget : fallbackTarget;
  target?.focus();
}

function clearFormError(form, messageElement) {
  messageElement.textContent = "";
  form.querySelectorAll('[aria-invalid="true"]').forEach((field) => {
    field.removeAttribute("aria-invalid");
  });
}

function showFormError(form, messageElement, message, fieldNames) {
  messageElement.textContent = message;
  const fields = fieldNames
    .map((name) => form.elements.namedItem(name))
    .filter(Boolean);
  fields.forEach((field) => field.setAttribute("aria-invalid", "true"));
  fields[0]?.focus();
}

function showForm(trigger = showLanguageFormButton) {
  languageFormReturnFocus = trigger;
  languageForm.hidden = false;
  clearFormError(languageForm, formMessage);
  languageForm.elements.name.focus();
}

function hideForm() {
  languageForm.hidden = true;
  languageForm.reset();
  clearFormError(languageForm, formMessage);
}

function selectLanguage(language) {
  selectedLanguage = language;
  categories = [];
  isCategoryListVisible = true;
  selectedCategoryId = Number(
    localStorage.getItem(`yolingo:selected-category:${language.id}`),
  ) || null;
  localStorage.setItem("yolingo:selected-language", String(language.id));
  document.querySelector("#selection-name").textContent = language.name;
  document.querySelector("#selection-flag").textContent = language.flag || "🌍";
  document.querySelector("#selection-code").textContent = language.code.toUpperCase();
  showLibraryView();
  hideCategoryForm();
  hideTagForm();
  availableTags = [];
  selectedFilterTagIds = new Set();
  clearTimeout(flashcardSearchTimer);
  resetFlashcardView({ clearFilters: true });
  renderTagFilters();
  renderFlashcardTagOptions();

  document.querySelectorAll(".language-card").forEach((card) => {
    const isActive = Number(card.dataset.id) === language.id;
    card.setAttribute("aria-pressed", String(isActive));
    card.querySelector(".card-status").hidden = !isActive;
    card.querySelector(".card-action").textContent = isActive ? "Continuar  →" : "Abrir  →";
  });
  loadTags(language.id);
  loadCategories(language.id);
}

function createLanguageCard(language) {
  const card = document.createElement("button");
  card.className = "language-card";
  card.type = "button";
  card.dataset.id = language.id;
  card.setAttribute("aria-pressed", "false");
  card.setAttribute("aria-label", `Abrir la biblioteca de ${language.name}`);

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

  const status = document.createElement("span");
  status.className = "card-status";
  status.textContent = "Idioma activo";
  status.hidden = language.id !== selectedLanguage?.id;

  const action = document.createElement("span");
  action.className = "card-action";
  action.setAttribute("aria-hidden", "true");
  action.textContent = language.id === selectedLanguage?.id ? "Continuar  →" : "Abrir  →";

  content.append(name, code, status);
  card.append(flag, content);
  card.append(action);
  card.addEventListener("click", () => selectLanguage(language));
  return card;
}

function renderLanguages() {
  languageList.replaceChildren(...languages.map(createLanguageCard));
  emptyState.hidden = languages.length > 0;
  showLanguageFormButton.hidden = languages.length === 0;

  const selectedId = Number(localStorage.getItem("yolingo:selected-language"));
  const storedLanguage = languages.find((language) => language.id === selectedId);
  if (storedLanguage) {
    selectLanguage(storedLanguage);
  } else {
    selectedLanguage = null;
    selection.hidden = true;
    categoryLibrary.hidden = true;
    updateAppShell();
  }
}

function showCategoryForm(parent = null, trigger = showCategoryFormButton) {
  categoryFormReturnFocus = trigger;
  categoryFormParentId = parent?.id ?? null;
  document.querySelector("#category-form-title").textContent = parent
    ? "Añade una subcategoría"
    : "Añade una categoría";
  document.querySelector("#category-form-hint").textContent = parent
    ? `Se creará dentro de ${parent.name}.`
    : "Crea un grupo para organizar tu vocabulario.";
  categoryForm.elements.name.placeholder = parent ? "Greetings" : "Everyday";
  clearFormError(categoryForm, categoryFormMessage);
  categoryForm.hidden = false;
  categoryForm.elements.name.focus();
}

function hideCategoryForm() {
  categoryForm.hidden = true;
  categoryForm.reset();
  clearFormError(categoryForm, categoryFormMessage);
  categoryFormParentId = null;
}

function createCategoryAction(label, className, handler) {
  const button = document.createElement("button");
  button.className = `category-action ${className}`;
  button.type = "button";
  button.textContent = label;
  button.addEventListener("click", handler);
  return button;
}

function createActionMenu(label, actions) {
  const menu = document.createElement("details");
  menu.className = "item-actions-menu";

  const trigger = document.createElement("summary");
  trigger.setAttribute("aria-label", label);
  trigger.title = label;
  trigger.textContent = "⋯";

  const popover = document.createElement("div");
  popover.className = "item-actions-popover";
  popover.append(...actions);
  popover.addEventListener("click", (event) => {
    if (event.target.closest("button")) menu.open = false;
  });
  menu.append(trigger, popover);
  return menu;
}

function createCategoryRow(category, isChild = false) {
  const row = document.createElement("div");
  row.className = `category-row ${isChild ? "category-row-child" : "category-row-root"}`;
  row.dataset.categoryId = category.id;

  const selectButton = document.createElement("button");
  selectButton.className = "category-select";
  selectButton.type = "button";
  const categoryName = document.createElement("span");
  categoryName.className = "category-select-name";
  categoryName.textContent = category.name;
  const categoryArrow = document.createElement("span");
  categoryArrow.className = "category-select-arrow";
  categoryArrow.setAttribute("aria-hidden", "true");
  categoryArrow.textContent = "›";
  selectButton.append(categoryName, categoryArrow);
  selectButton.setAttribute("aria-current", String(category.id === selectedCategoryId));
  selectButton.addEventListener("click", () => selectCategory(category));
  row.append(selectButton);

  const actions = [];
  if (!isChild) {
    actions.push(
      createCategoryAction(
        "Nueva subcategoría",
        "category-add-child",
        (event) => showCategoryForm(category, event.currentTarget),
      ),
    );
  }

  actions.push(
    createCategoryAction(
      "Eliminar categoría",
      "category-delete",
      (event) => deleteCategory(category, event.currentTarget),
    ),
  );
  row.append(createActionMenu(`Acciones para ${category.name}`, actions));
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
  categoryContent.classList.toggle(
    "showing-category",
    Boolean(category) && !isCategoryListVisible,
  );
  categoryLibrary.classList.toggle(
    "showing-category",
    Boolean(category) && !isCategoryListVisible,
  );
  renderLibraryContext(category);
  updateAppShell();
  return category;
}

function renderLibraryContext(category) {
  if (!selectedLanguage || !category) {
    libraryContextSummary.textContent = "";
    return;
  }
  const parent = category.parent_id === null
    ? null
    : categories.find((item) => item.id === category.parent_id);
  libraryContextSummary.textContent = [selectedLanguage.name, parent?.name, category.name]
    .filter(Boolean)
    .join(" → ");
}

function selectCategory(category) {
  selectedCategoryId = category.id;
  isCategoryListVisible = false;
  localStorage.setItem(
    `yolingo:selected-category:${selectedLanguage.id}`,
    String(category.id),
  );
  updateCategorySelection();
  loadFlashcards(category.id);
}

function showCategoryList() {
  if (!selectedLanguage) return;
  isCategoryListVisible = true;
  updateCategorySelection();
  categoryTree
    .querySelector(`[data-category-id="${selectedCategoryId}"] .category-select`)
    ?.focus();
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
  categoryLoadError.hidden = true;
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
      categoryStatus.textContent = "";
      categoryLoadError.hidden = false;
    }
  } finally {
    if (selectedLanguage?.id === languageId) {
      categoryLoading.hidden = true;
      categoryLibrary.setAttribute("aria-busy", "false");
    }
  }
}

async function responseError(response, fallback) {
  if (response.status >= 500) return fallback;
  try {
    const body = await response.json();
    return typeof body.detail === "string" ? body.detail : fallback;
  } catch {
    return fallback;
  }
}

async function submitCategory(event) {
  event.preventDefault();
  clearFormError(categoryForm, categoryFormMessage);
  const submitButton = categoryForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = "Creando…";
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
    isCategoryListVisible = false;
    localStorage.setItem(`yolingo:selected-category:${languageId}`, String(category.id));
    renderCategories();
    categoryStatus.textContent = `${category.name} se ha creado correctamente.`;
    showFlashcardFormButton.focus();
  } catch (error) {
    showFormError(categoryForm, categoryFormMessage, error.message, ["name"]);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Crear";
  }
}

async function deleteCategory(category, deleteButton) {
  const hasChildren = categories.some((item) => item.parent_id === category.id);
  const warning = hasChildren
    ? `¿Eliminar ${category.name} y todas sus subcategorías?`
    : `¿Eliminar ${category.name}?`;
  if (!window.confirm(warning)) return;

  deleteButton.disabled = true;
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
      isCategoryListVisible = true;
      localStorage.removeItem(`yolingo:selected-category:${languageId}`);
    }
    renderCategories();
    categoryStatus.textContent = `${category.name} se ha eliminado.`;
    const selectedCategoryButton = categoryTree.querySelector(
      `[data-category-id="${selectedCategoryId}"] .category-select`,
    );
    restoreFocus(
      selectedCategoryButton || categoryTree.querySelector(".category-select"),
      showCategoryFormButton,
    );
  } catch (error) {
    categoryStatus.textContent = error.message;
  } finally {
    deleteButton.disabled = false;
  }
}

function resetFlashcardView({ clearFilters = false } = {}) {
  flashcardLoadVersion += 1;
  flashcards = [];
  activeFlashcardCategoryId = null;
  if (clearFilters) {
    flashcardSearch.value = "";
    selectedFilterTagIds = new Set();
  }
  flashcardStatus.textContent = "";
  flashcardResultsSummary.textContent = "";
  flashcardLoading.hidden = true;
  flashcardEmpty.hidden = true;
  retryFlashcardsButton.hidden = true;
  flashcardList.replaceChildren();
  categoryContext.setAttribute("aria-busy", "false");
  showFlashcardFormButton.disabled = false;
  startStudyButton.disabled = true;
  flashcardSearch.disabled = false;
  hideFlashcardForm();
  updateClearFiltersButton();
}

function showFlashcardForm(flashcard = null, trigger = showFlashcardFormButton) {
  flashcardFormReturnFocus = trigger;
  editingFlashcardId = flashcard?.id ?? null;
  flashcardForm.reset();
  clearFormError(flashcardForm, flashcardFormMessage);
  document.querySelector("#flashcard-form-title").textContent = flashcard
    ? "Editar flashcard"
    : "Nueva flashcard";
  if (flashcard) {
    flashcardForm.elements.term.value = flashcard.term;
    flashcardForm.elements.translation.value = flashcard.translation;
    flashcardForm.elements.example.value = flashcard.example || "";
    flashcardForm.elements.notes.value = flashcard.notes || "";
  }
  renderFlashcardTagOptions(
    new Set((flashcard?.tags || []).map((tag) => tag.id)),
  );
  flashcardForm.hidden = false;
  flashcardForm.elements.term.focus();
}

function hideFlashcardForm() {
  flashcardForm.hidden = true;
  flashcardForm.reset();
  clearFormError(flashcardForm, flashcardFormMessage);
  editingFlashcardId = null;
}

function selectedFlashcardTagIds() {
  return Array.from(
    flashcardTagOptions.querySelectorAll('input[type="checkbox"]:checked'),
    (input) => Number(input.value),
  );
}

function renderFlashcardTagOptions(selectedIds = new Set()) {
  const options = availableTags.map((tag) => {
    const label = document.createElement("label");
    label.className = "flashcard-tag-option";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "tag_ids";
    checkbox.value = tag.id;
    checkbox.checked = selectedIds.has(tag.id);
    label.append(checkbox, document.createTextNode(tag.name));
    return label;
  });
  flashcardTagOptions.replaceChildren(...options);
  if (options.length === 0) {
    const message = document.createElement("span");
    message.className = "tag-empty";
    message.textContent = "Crea un tag para poder asociarlo.";
    flashcardTagOptions.append(message);
  }
}

function updateClearFiltersButton() {
  const search = flashcardSearch.value.trim();
  const selectedTags = availableTags.filter((tag) => selectedFilterTagIds.has(tag.id));
  const descriptions = [];
  if (search) descriptions.push(`Texto: “${search}”`);
  if (selectedTags.length) {
    descriptions.push(`Tags: ${selectedTags.map((tag) => tag.name).join(" + ")}`);
  }
  const hasFilters = descriptions.length > 0;
  clearFiltersButton.hidden = !hasFilters;
  activeFilterSummary.hidden = !hasFilters;
  activeFilterDescription.textContent = descriptions.join(" · ");
  filterPanelHint.textContent = hasFilters ? "Activos" : "Ajustar";
}

function renderTagFilters() {
  const items = availableTags.map((tag) => {
    const item = document.createElement("span");
    item.className = "tag-filter-item";

    const toggleButton = document.createElement("button");
    toggleButton.className = "tag-filter-toggle";
    toggleButton.type = "button";
    toggleButton.dataset.tagId = tag.id;
    toggleButton.textContent = tag.name;
    toggleButton.setAttribute("aria-label", `Filtrar por tag ${tag.name}`);
    toggleButton.setAttribute("aria-pressed", String(selectedFilterTagIds.has(tag.id)));
    toggleButton.addEventListener("click", () => {
      if (selectedFilterTagIds.has(tag.id)) {
        selectedFilterTagIds.delete(tag.id);
      } else {
        selectedFilterTagIds.add(tag.id);
      }
      renderTagFilters();
      tagFilterList.querySelector(`[data-tag-id="${tag.id}"]`)?.focus();
      if (selectedCategoryId !== null) loadFlashcards(selectedCategoryId);
    });

    const deleteButton = document.createElement("button");
    deleteButton.className = "tag-filter-delete";
    deleteButton.type = "button";
    deleteButton.textContent = "×";
    deleteButton.title = `Eliminar ${tag.name}`;
    deleteButton.setAttribute("aria-label", `Eliminar tag ${tag.name}`);
    deleteButton.addEventListener("click", () => deleteTag(tag, deleteButton));
    item.append(toggleButton, deleteButton);
    return item;
  });
  tagFilterList.replaceChildren(...items);
  tagEmpty.hidden = items.length > 0;
  updateClearFiltersButton();
}

async function loadTags(languageId) {
  tagTools.setAttribute("aria-busy", "true");
  tagStatus.textContent = "";
  retryTagsButton.hidden = true;
  showTagFormButton.disabled = true;
  tagEmpty.hidden = false;
  tagEmpty.textContent = "Cargando tags…";
  try {
    const response = await fetch(`/api/v1/languages/${languageId}/tags`);
    if (!response.ok) throw new Error("No se pudieron cargar los tags.");
    const loadedTags = await response.json();
    if (selectedLanguage?.id !== languageId) return;
    availableTags = loadedTags;
    selectedFilterTagIds = new Set(
      [...selectedFilterTagIds].filter((id) => availableTags.some((tag) => tag.id === id)),
    );
    tagEmpty.textContent = "Todavía no hay tags en este idioma.";
    renderTagFilters();
    renderFlashcardTagOptions();
  } catch (error) {
    if (selectedLanguage?.id === languageId) {
      availableTags = [];
      tagFilterList.replaceChildren();
      tagEmpty.hidden = false;
      tagEmpty.textContent = error.message;
      retryTagsButton.hidden = false;
      renderFlashcardTagOptions();
    }
  } finally {
    if (selectedLanguage?.id === languageId) {
      tagTools.setAttribute("aria-busy", "false");
      showTagFormButton.disabled = false;
    }
  }
}

function showTagForm() {
  filterPanel.open = true;
  tagForm.hidden = false;
  clearFormError(tagForm, tagFormMessage);
  tagStatus.textContent = "";
  showTagFormButton.hidden = true;
  tagForm.elements.name.focus();
}

function hideTagForm() {
  tagForm.hidden = true;
  tagForm.reset();
  clearFormError(tagForm, tagFormMessage);
  showTagFormButton.hidden = false;
}

async function submitTag(event) {
  event.preventDefault();
  clearFormError(tagForm, tagFormMessage);
  const submitButton = tagForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = "Creando…";
  const languageId = selectedLanguage.id;
  const selectedIds = new Set(selectedFlashcardTagIds());

  try {
    const response = await fetch(`/api/v1/languages/${languageId}/tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: new FormData(tagForm).get("name") }),
    });
    if (!response.ok) {
      throw new Error(await responseError(response, "No se pudo crear el tag."));
    }
    const tag = await response.json();
    if (selectedLanguage?.id !== languageId) return;
    availableTags.push(tag);
    availableTags.sort((first, second) => first.name.localeCompare(second.name));
    selectedIds.add(tag.id);
    hideTagForm();
    renderTagFilters();
    renderFlashcardTagOptions(selectedIds);
    tagStatus.textContent = `${tag.name} se ha creado correctamente.`;
    tagFilterList.querySelector(`[data-tag-id="${tag.id}"]`)?.focus();
  } catch (error) {
    showFormError(tagForm, tagFormMessage, error.message, ["name"]);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Crear tag";
  }
}

async function deleteTag(tag, deleteButton) {
  if (!window.confirm(`¿Eliminar el tag ${tag.name}?`)) return;

  deleteButton.disabled = true;
  const languageId = selectedLanguage.id;
  tagStatus.textContent = `Eliminando ${tag.name}…`;
  const wasFiltering = selectedFilterTagIds.has(tag.id);
  const selectedIds = new Set(
    selectedFlashcardTagIds().filter((tagId) => tagId !== tag.id),
  );
  try {
    const response = await fetch(`/api/v1/tags/${tag.id}`, { method: "DELETE" });
    if (!response.ok) {
      throw new Error(await responseError(response, "No se pudo eliminar el tag."));
    }
    if (selectedLanguage?.id !== languageId) return;
    availableTags = availableTags.filter((item) => item.id !== tag.id);
    selectedFilterTagIds.delete(tag.id);
    flashcards = flashcards.map((flashcard) => ({
      ...flashcard,
      tags: (flashcard.tags || []).filter((item) => item.id !== tag.id),
    }));
    renderTagFilters();
    renderFlashcardTagOptions(selectedIds);
    if (wasFiltering && selectedCategoryId !== null) {
      await loadFlashcards(selectedCategoryId);
    } else {
      renderFlashcards();
    }
    if (selectedLanguage?.id !== languageId) return;
    tagStatus.textContent = `${tag.name} se ha eliminado.`;
    const nextFocus = tagFilterList.querySelector(".tag-filter-toggle")
      || showTagFormButton;
    nextFocus.focus();
  } catch (error) {
    tagStatus.textContent = error.message;
    deleteButton.disabled = false;
  }
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
  if (flashcard.tags?.length) {
    const tags = document.createElement("div");
    tags.className = "flashcard-tags";
    flashcard.tags.forEach((tag) => {
      const chip = document.createElement("span");
      chip.className = "flashcard-tag";
      chip.textContent = tag.name;
      tags.append(chip);
    });
    item.append(tags);
  }

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.textContent = "Editar";
  editButton.setAttribute("aria-label", `Editar ${flashcard.term}`);
  editButton.addEventListener("click", (event) => {
    showFlashcardForm(flashcard, event.currentTarget);
  });
  const deleteButton = document.createElement("button");
  deleteButton.className = "flashcard-delete";
  deleteButton.type = "button";
  deleteButton.textContent = "Eliminar";
  deleteButton.setAttribute("aria-label", `Eliminar ${flashcard.term}`);
  deleteButton.addEventListener("click", () => deleteFlashcard(flashcard, deleteButton));
  const actions = createActionMenu(
    `Acciones para ${flashcard.term}`,
    [editButton, deleteButton],
  );
  actions.classList.add("flashcard-item-actions");
  item.append(actions);
  return item;
}

function renderFlashcards() {
  flashcardList.replaceChildren(...flashcards.map(createFlashcardItem));
  flashcardEmpty.hidden = flashcards.length > 0;

  const emptyTitle = document.querySelector("#flashcard-empty-title");
  const emptyCopy = document.querySelector("#flashcard-empty-copy");
  const search = flashcardSearch.value.trim();
  const hasSearch = Boolean(search);
  const hasTagFilters = selectedFilterTagIds.size > 0;
  const hasFilters = hasSearch || hasTagFilters;
  const countLabel = flashcards.length === 1 ? "1 flashcard" : `${flashcards.length} flashcards`;
  flashcardResultsSummary.textContent = hasFilters
    ? `${countLabel} con los filtros actuales.`
    : countLabel;
  retryFlashcardsButton.hidden = true;
  startStudyButton.disabled = false;
  if (flashcards.length === 0 && hasSearch && hasTagFilters) {
    emptyTitle.textContent = "No hay coincidencias con estos filtros";
    emptyCopy.textContent = `Prueba otro texto en lugar de “${search}” o cambia los tags.`;
  } else if (flashcards.length === 0 && hasSearch) {
    emptyTitle.textContent = `No hay coincidencias para “${search}”`;
    emptyCopy.textContent = "Prueba con otro término o traducción.";
  } else if (flashcards.length === 0 && hasTagFilters) {
    emptyTitle.textContent = "No hay flashcards con todos esos tags";
    emptyCopy.textContent = "Quita algún tag seleccionado para ampliar los resultados.";
  } else {
    emptyTitle.textContent = "Aún no hay flashcards";
    emptyCopy.textContent = "Crea la primera para comenzar tu vocabulario.";
  }
  updateClearFiltersButton();
}

function currentFlashcardQuery() {
  const query = new URLSearchParams();
  const search = flashcardSearch.value.trim();
  if (search) query.set("search", search);
  [...selectedFilterTagIds]
    .sort((first, second) => first - second)
    .forEach((tagId) => query.append("tag_ids", tagId));
  return query.toString();
}

function showStudyView() {
  hero.hidden = true;
  languageLibrary.hidden = true;
  selection.hidden = true;
  categoryLibrary.hidden = true;
  studyView.hidden = false;
  setCurrentNavigation(navStudyButton);
  updateAppShell();
  studyView.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderStudySession() {
  const total = studySession?.progress.total || 0;
  const isEmpty = total === 0;
  const isCompleted = Boolean(studySession?.isFinished && !isEmpty);
  const isActive = Boolean(studySession && !studySession.isFinished);

  studyActive.hidden = !isActive;
  studyEmpty.hidden = !isEmpty;
  studyCompleted.hidden = !isCompleted;
  if (isEmpty) {
    studyEmpty.focus();
    return;
  }
  if (isCompleted) {
    document.querySelector("#study-completed-summary").textContent = (
      `Has estudiado ${total} ${total === 1 ? "flashcard" : "flashcards"}.`
    );
    studyCompleted.focus();
    return;
  }

  const card = studySession.currentCard;
  document.querySelector("#study-term").textContent = card.term;
  document.querySelector("#study-translation").textContent = card.translation;
  document.querySelector("#study-example").textContent = card.example || "";
  document.querySelector("#study-notes").textContent = card.notes || "";
  document.querySelector("#study-example-row").hidden = !card.example;
  document.querySelector("#study-notes-row").hidden = !card.notes;
  studyAnswer.hidden = !studySession.isAnswerVisible;
  revealAnswerButton.hidden = studySession.isAnswerVisible;
  nextStudyCardButton.hidden = !studySession.isAnswerVisible;
  document.querySelector("#study-progress").textContent = (
    `${studySession.progress.current} / ${total}`
  );
  studyCard.focus();
}

function cancelStudyLoad() {
  studyLoadController?.abort();
  studyLoadController = null;
  startStudyButton.removeAttribute("aria-busy");
  startStudyButton.textContent = "Estudiar";
}

async function startStudy() {
  if (!selectedLanguage || selectedCategoryId === null) return;
  const languageId = selectedLanguage.id;
  const categoryId = selectedCategoryId;
  const queryString = currentFlashcardQuery();
  cancelStudyLoad();
  const controller = new AbortController();
  studyLoadController = controller;
  startStudyButton.disabled = true;
  startStudyButton.textContent = "Preparando…";
  startStudyButton.setAttribute("aria-busy", "true");
  flashcardStatus.textContent = "Preparando la sesión de estudio…";

  try {
    const response = await fetch(
      `/api/v1/languages/${languageId}/categories/${categoryId}/study-flashcards${queryString ? `?${queryString}` : ""}`,
      { signal: controller.signal },
    );
    if (!response.ok) {
      throw new Error(await responseError(response, "No se pudo preparar la sesión de estudio."));
    }
    const cards = await response.json();
    if (
      selectedLanguage?.id !== languageId
      || selectedCategoryId !== categoryId
      || currentFlashcardQuery() !== queryString
    ) return;

    studySession = new StudySession(cards);
    document.querySelector("#study-context").textContent = libraryContextSummary.textContent;
    flashcardStatus.textContent = "";
    showStudyView();
    renderStudySession();
  } catch (error) {
    if (
      error.name !== "AbortError"
      && selectedLanguage?.id === languageId
      && selectedCategoryId === categoryId
    ) {
      flashcardStatus.textContent = error.message;
      startStudyButton.focus();
    }
  } finally {
    if (studyLoadController === controller) {
      studyLoadController = null;
      startStudyButton.disabled = false;
      startStudyButton.removeAttribute("aria-busy");
      startStudyButton.textContent = "Estudiar";
    }
  }
}

function leaveStudy(message = "") {
  studySession = null;
  showLibraryView();
  flashcardStatus.textContent = message;
  startStudyButton.focus();
}

async function loadFlashcards(categoryId) {
  cancelStudyLoad();
  flashcardLoadVersion += 1;
  const loadVersion = flashcardLoadVersion;
  const categoryChanged = activeFlashcardCategoryId !== categoryId;
  flashcards = [];
  flashcardList.replaceChildren();
  flashcardEmpty.hidden = true;
  flashcardStatus.textContent = "";
  flashcardResultsSummary.textContent = "";
  retryFlashcardsButton.hidden = true;
  if (categoryChanged) hideFlashcardForm();
  activeFlashcardCategoryId = categoryId;
  const languageId = selectedLanguage.id;
  categoryContext.setAttribute("aria-busy", "true");
  flashcardLoading.hidden = false;
  showFlashcardFormButton.disabled = true;
  startStudyButton.disabled = true;

  try {
    const queryString = currentFlashcardQuery();
    const response = await fetch(
      `/api/v1/languages/${languageId}/categories/${categoryId}/flashcards${queryString ? `?${queryString}` : ""}`,
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
      document.querySelector("#flashcard-empty-title").textContent = "No pudimos cargar las flashcards";
      document.querySelector("#flashcard-empty-copy").textContent = "Comprueba la conexión e inténtalo de nuevo.";
      flashcardEmpty.hidden = false;
      retryFlashcardsButton.hidden = false;
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
      startStudyButton.disabled = false;
    }
  }
}

async function submitFlashcard(event) {
  event.preventDefault();
  clearFormError(flashcardForm, flashcardFormMessage);
  const submitButton = flashcardForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = "Guardando…";
  const languageId = selectedLanguage.id;
  const categoryId = selectedCategoryId;
  const flashcardId = editingFlashcardId;
  const tagIds = selectedFlashcardTagIds();
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

    const tagResponse = await fetch(`/api/v1/flashcards/${saved.id}/tags`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tag_ids: tagIds }),
    });
    if (selectedLanguage?.id !== languageId || selectedCategoryId !== categoryId) return;
    if (!tagResponse.ok) {
      hideFlashcardForm();
      await loadFlashcards(categoryId);
      flashcardStatus.textContent = (
        `${saved.term} se guardó, pero no se pudieron actualizar sus tags.`
      );
      return;
    }
    hideFlashcardForm();
    await loadFlashcards(categoryId);
    if (selectedLanguage?.id !== languageId || selectedCategoryId !== categoryId) return;
    flashcardStatus.textContent = flashcardId
      ? `${saved.term} se ha actualizado.`
      : `${saved.term} se ha creado correctamente.`;
    document.querySelector(`[data-flashcard-id="${saved.id}"]`)?.focus();
  } catch (error) {
    showFormError(
      flashcardForm,
      flashcardFormMessage,
      error.message,
      ["term", "translation"],
    );
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Guardar";
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
  languageLibrary.setAttribute("aria-busy", "true");
  languageLoading.hidden = false;
  languageLoadError.hidden = true;
  emptyState.hidden = true;
  languageList.replaceChildren();
  try {
    const response = await fetch("/api/v1/languages");
    if (!response.ok) throw new Error("No pudimos cargar tus idiomas.");
    languages = await response.json();
    renderLanguages();
  } catch {
    languages = [];
    selectedLanguage = null;
    selection.hidden = true;
    categoryLibrary.hidden = true;
    languageLoadError.hidden = false;
    updateAppShell();
  } finally {
    languageLoading.hidden = true;
    languageLibrary.setAttribute("aria-busy", "false");
  }
}

async function submitLanguage(event) {
  event.preventDefault();
  clearFormError(languageForm, formMessage);
  const submitButton = languageForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = "Creando…";
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
      throw new Error(
        await responseError(
          response,
          "No se pudo crear el idioma. Revisa el nombre y el código.",
        ),
      );
    }

    const language = await response.json();
    languages.push(language);
    languages.sort((first, second) => first.name.localeCompare(second.name));
    hideForm();
    localStorage.setItem("yolingo:selected-language", String(language.id));
    renderLanguages();
    languageList.querySelector(`[data-id="${language.id}"]`)?.focus();
  } catch (error) {
    showFormError(languageForm, formMessage, error.message, ["name", "code"]);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Crear idioma";
  }
}

showLanguageFormButton.addEventListener("click", (event) => {
  showForm(event.currentTarget);
});
brandHomeLink.addEventListener("click", (event) => {
  event.preventDefault();
  showHomeView();
});
headerLanguageButton.addEventListener("click", showLibraryView);
navHomeButton.addEventListener("click", showHomeView);
navLibraryButton.addEventListener("click", showLibraryView);
navStudyButton.addEventListener("click", startStudy);
document.querySelector("#empty-action").addEventListener("click", (event) => {
  showForm(event.currentTarget);
});
document.querySelector("#close-form-button").addEventListener("click", () => {
  hideForm();
  restoreFocus(languageFormReturnFocus, showLanguageFormButton);
});
showCategoryFormButton.addEventListener("click", (event) => {
  showCategoryForm(null, event.currentTarget);
});
mobileCategoryBack.addEventListener("click", showCategoryList);
document.querySelector("#category-empty-action").addEventListener("click", (event) => {
  showCategoryForm(null, event.currentTarget);
});
document.querySelector("#close-category-form-button").addEventListener("click", () => {
  hideCategoryForm();
  restoreFocus(categoryFormReturnFocus, showCategoryFormButton);
});
showTagFormButton.addEventListener("click", showTagForm);
document.querySelector("#cancel-tag-form-button").addEventListener("click", () => {
  hideTagForm();
  showTagFormButton.focus();
});
retryTagsButton.addEventListener("click", () => {
  if (selectedLanguage) loadTags(selectedLanguage.id);
});
document.querySelector("#retry-languages-button").addEventListener("click", loadLanguages);
document.querySelector("#retry-categories-button").addEventListener("click", () => {
  if (selectedLanguage) loadCategories(selectedLanguage.id);
});
showFlashcardFormButton.addEventListener("click", (event) => {
  showFlashcardForm(null, event.currentTarget);
});
document.querySelector("#close-flashcard-form-button").addEventListener("click", () => {
  hideFlashcardForm();
  restoreFocus(flashcardFormReturnFocus, showFlashcardFormButton);
});
document.querySelector("#cancel-flashcard-form-button").addEventListener("click", () => {
  hideFlashcardForm();
  restoreFocus(flashcardFormReturnFocus, showFlashcardFormButton);
});
[
  [languageForm, formMessage],
  [categoryForm, categoryFormMessage],
  [tagForm, tagFormMessage],
  [flashcardForm, flashcardFormMessage],
].forEach(([form, messageElement]) => {
  form.addEventListener("input", (event) => {
    if (event.target.getAttribute("aria-invalid") === "true") {
      clearFormError(form, messageElement);
    }
  });
});
languageForm.addEventListener("submit", submitLanguage);
categoryForm.addEventListener("submit", submitCategory);
tagForm.addEventListener("submit", submitTag);
flashcardForm.addEventListener("submit", submitFlashcard);
flashcardSearch.addEventListener("input", () => {
  cancelStudyLoad();
  clearTimeout(flashcardSearchTimer);
  flashcardResultsSummary.textContent = "";
  updateClearFiltersButton();
  if (selectedCategoryId === null) return;
  flashcardSearchTimer = setTimeout(() => loadFlashcards(selectedCategoryId), 250);
});
clearFiltersButton.addEventListener("click", () => {
  clearTimeout(flashcardSearchTimer);
  flashcardSearch.value = "";
  selectedFilterTagIds = new Set();
  renderTagFilters();
  if (selectedCategoryId !== null) {
    loadFlashcards(selectedCategoryId);
    flashcardSearch.focus();
  }
});
retryFlashcardsButton.addEventListener("click", () => {
  if (selectedCategoryId !== null) loadFlashcards(selectedCategoryId);
});
startStudyButton.addEventListener("click", startStudy);
revealAnswerButton.addEventListener("click", () => {
  if (!studySession?.revealAnswer()) return;
  renderStudySession();
  nextStudyCardButton.focus();
});
nextStudyCardButton.addEventListener("click", () => {
  if (!studySession?.next()) return;
  renderStudySession();
  if (!studySession.isFinished) revealAnswerButton.focus();
});
document.querySelector("#abandon-study-button").addEventListener("click", () => {
  leaveStudy("Has abandonado la sesión de estudio.");
});
document.querySelector("#empty-study-back-button").addEventListener("click", () => leaveStudy());
document.querySelector("#completed-study-back-button").addEventListener("click", () => {
  leaveStudy("Sesión completada. Puedes estudiar este conjunto de nuevo cuando quieras.");
});
document.querySelector("#restart-study-button").addEventListener("click", () => {
  if (!studySession) return;
  studySession.restart();
  renderStudySession();
  revealAnswerButton.focus();
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!studyView.hidden) {
    leaveStudy("Has abandonado la sesión de estudio.");
  } else if (!flashcardForm.hidden) {
    hideFlashcardForm();
    restoreFocus(flashcardFormReturnFocus, showFlashcardFormButton);
  } else if (!tagForm.hidden) {
    hideTagForm();
    showTagFormButton.focus();
  } else if (!categoryForm.hidden) {
    hideCategoryForm();
    restoreFocus(categoryFormReturnFocus, showCategoryFormButton);
  } else if (!languageForm.hidden) {
    hideForm();
    restoreFocus(languageFormReturnFocus, showLanguageFormButton);
  } else if (!isCategoryListVisible && selectedCategoryId !== null) {
    showCategoryList();
  }
});

loadLanguages();
