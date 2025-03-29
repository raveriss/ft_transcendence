// frontend/static/js/i18n.js

console.log("i18n.js loaded");

let translationsCache = {}; // Stockage des traductions chargées

// Fonction pour récupérer la langue actuelle
function getCurrentLang() {
  return localStorage.getItem("lang") || "en";
}

// Fonction pour charger les traductions (gestion du cache)
function loadTranslations(lang = getCurrentLang(), callback = () => {}) {
  if (translationsCache[lang]) {
    applyTranslations(translationsCache[lang]);
    callback();
    return;
  }

  fetch("/static/js/translations.json")
    .then(response => response.json())
    .then(data => {
      if (!data[lang]) {
        console.warn(`Langue "${lang}" non trouvée dans translations.json. Utilisation de l'anglais par défaut.`);
        lang = "en"; // Repli sur l'anglais si la langue demandée n'existe pas
      }
      Object.assign(translationsCache, data); // Fusionner les traductions au lieu d'écraser
      applyTranslations(translationsCache[lang]);
      localStorage.setItem("lang", lang);
      callback();
    })
    .catch(error => console.error("Erreur de chargement des traductions :", error));
}

// Fonction pour appliquer les traductions sur la page
function applyTranslations(translations) {
  if (!translations) return;

  document.querySelectorAll("[data-i18n]").forEach(elem => {
    let key = elem.getAttribute("data-i18n");
    if (translations[key]) {
      if (elem.tagName === "INPUT" || elem.tagName === "TEXTAREA") {
        elem.placeholder = translations[key]; // Placeholder pour inputs
      } else if (elem.hasAttribute("value")) {
        elem.value = translations[key]; // Valeur pour boutons
      } else if (elem.hasAttribute("title")) {
        elem.title = translations[key]; // Titre pour tooltips
      } else {
        elem.innerHTML = translations[key]; // Texte HTML normal
      }
    }
  });

  console.log("✅ Traductions appliquées sur :", window.location.pathname);
  // 🔹 Émet un événement global après application des traductions
  document.dispatchEvent(new CustomEvent("languageChanged", { detail: { lang: getCurrentLang() } }));
}

// Fonction pour changer la langue
function changeLanguage(lang) {
  localStorage.setItem("lang", lang); // Sauvegarde la langue sélectionnée
  loadTranslations(lang, () => {
    if (translationsCache[lang]) {
      applyTranslations(translationsCache[lang]);
    }
  });
}

function t(key) {
  const lang = getCurrentLang();
  return translationsCache[lang]?.[key] || key;
}

// Exécuter immédiatement la traduction avant le chargement du DOM pour éviter un effet flash
document.addEventListener("DOMContentLoaded", () => {
  loadTranslations();
});

// Vérifier s'il y a un sélecteur de langue et l'initialiser
document.addEventListener("DOMContentLoaded", () => {
  const langSelector = document.getElementById("language-selector");
  if (langSelector) {
    langSelector.value = getCurrentLang();
    langSelector.addEventListener("change", (event) => {
      const selectedLang = event.target.value;
      changeLanguage(selectedLang);
    });
  }
});
