const languageList = document.querySelector("#language-list");
const emptyState = document.querySelector("#empty-state");
const languageForm = document.querySelector("#language-form");
const formMessage = document.querySelector("#form-message");
const selection = document.querySelector("#selection");

let languages = [];

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
  localStorage.setItem("yolingo:selected-language", String(language.id));
  document.querySelector("#selection-name").textContent = language.name;
  document.querySelector("#selection-flag").textContent = language.flag || "🌍";
  selection.hidden = false;

  document.querySelectorAll(".language-card").forEach((card) => {
    card.setAttribute("aria-pressed", String(Number(card.dataset.id) === language.id));
  });
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
  const selectedLanguage = languages.find((language) => language.id === selectedId);
  if (selectedLanguage) {
    selectLanguage(selectedLanguage);
  } else {
    selection.hidden = true;
  }
}

async function loadLanguages() {
  try {
    const response = await fetch("/api/v1/languages");
    if (!response.ok) throw new Error("No se pudo cargar la biblioteca.");
    languages = await response.json();
    renderLanguages();
  } catch (error) {
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
    renderLanguages();
    selectLanguage(language);
  } catch (error) {
    formMessage.textContent = error.message;
  }
}

document.querySelector("#show-form-button").addEventListener("click", showForm);
document.querySelector("#empty-action").addEventListener("click", showForm);
document.querySelector("#close-form-button").addEventListener("click", hideForm);
languageForm.addEventListener("submit", submitLanguage);

loadLanguages();
