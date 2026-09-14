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

let languages = [];
let selectedLanguage = null;
let categories = [];
let selectedCategoryId = null;
let categoryFormParentId = null;

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
}

function selectCategory(category) {
  selectedCategoryId = category.id;
  localStorage.setItem(
    `yolingo:selected-category:${selectedLanguage.id}`,
    String(category.id),
  );
  updateCategorySelection();
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
  updateCategorySelection();
}

async function loadCategories(languageId) {
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
languageForm.addEventListener("submit", submitLanguage);
categoryForm.addEventListener("submit", submitCategory);

loadLanguages();
