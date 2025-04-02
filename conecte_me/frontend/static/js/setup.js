console.log("setup.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  const storedLang = getCurrentLang();
  changeLanguage(storedLang);
});

// Récupérer le token JWT globalement
// if (typeof token === 'undefined') {
//   var token = localStorage.getItem('jwtToken');
// }
// console.log("Token récupéré dans setup.js:", token);

// Fonction debounce pour retarder la sauvegarde
function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

// Définition des variables globales
if (typeof timeRange === "undefined") {
  var timeRange, scoreLimitSelect, livesInput, ballSpeedRange, selectedMapChoice, selectedPaddleSize;
}
if (typeof updateSettingsDebounced === "undefined") {
  var updateSettingsDebounced = debounce(updateSettings, 500);
}

// Sauvegarde via POST
function updateSettings() {
  if (!scoreLimitSelect) return; // Sécurité si la page n'est pas encore prête

  // Récupérer le score limit
  let match = scoreLimitSelect.value.match(/\d+/);
  let scoreLimit = match ? parseInt(match[0]) : 5;


  // Construire l'objet de configuration
  const settings = {
    time: parseInt(timeRange.value),
    score_limit: scoreLimit,
    lives: parseInt(livesInput.value),
    ball_speed: parseInt(ballSpeedRange.value),
    map_choice: selectedMapChoice,
    paddle_size: selectedPaddleSize || 'medium',
    particles_enabled: document.getElementById('particlesToggle').checked,
    paddle_hit_sound_enabled: document.getElementById('paddleSoundToggle').checked
  };

  console.log("Envoi du POST avec settings:", settings);

  fetch("/api/game_settings/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
      // Le header Authorization n'est plus nécessaire, le cookie sécurisé transmet le token automatiquement
    },
    credentials: "same-origin", // Permet d'envoyer les cookies avec la requête
    body: JSON.stringify(settings)
  })
  .then(response => {
    if (response.status === 401) {
      logoutAndClearStorage();
      throw new Error("HTTP 401 - Token expiré, déconnexion en cours");
    }
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    }
    return response.json();
  })
  .then(data => {
    if (!data.success) {
      console.error("Erreur lors de l'enregistrement des réglages:", data);
    } else {
      console.log("Réglages mis à jour avec succès.");
    }
  })
  .catch(error => {
    console.error("Erreur:", error);
  });
}

function initSetupPage() {
  console.log("initSetupPage() déclenchée");

  // Vérifier l'existence du conteneur setup
  const setupContainer = document.getElementById("setup-container");
  if (!setupContainer) {
      console.error("setup-container non trouvé !");
      return;
  }

  // Sélection des éléments interactifs
  timeRange = document.getElementById("timeRange");
  scoreLimitSelect = document.getElementById("scoreLimitSelect");
  livesInput = document.getElementById("livesInput");
  ballSpeedRange = document.getElementById("ballSpeedRange");

  // Gestion du choix de la carte (map)
  const mapChoiceButtons = document.querySelectorAll('#mapChoiceGroup button');
  selectedMapChoice = "retro"; // Valeur par défaut

  mapChoiceButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.map === 'retro');
  });

  mapChoiceButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      mapChoiceButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedMapChoice = btn.dataset.map;
      console.log("Map sélectionnée :", selectedMapChoice);
      updateSettingsDebounced();
    });
  });

  // Gestion des boutons PADDLE SIZE
  const paddleSizeButtons = document.querySelectorAll('[data-i18n^="paddle_size_"]');
  selectedPaddleSize = "medium";

  paddleSizeButtons.forEach(btn => {
    const btnSize = btn.dataset.i18n.replace('paddle_size_', '').toLowerCase();
    if (btnSize === selectedPaddleSize) {
      btn.classList.add('active');
    }
  });

  paddleSizeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      paddleSizeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedPaddleSize = btn.dataset.i18n.replace('paddle_size_', '').toLowerCase();
      console.log("Paddle size sélectionné:", selectedPaddleSize);
      updateSettingsDebounced();
    });
  });

  // Gestion des sliders et inputs
  function handleSliderInput(slider) {
    const value = (slider.value - slider.min) / (slider.max - slider.min) * 100;
    slider.style.setProperty('--slider-value', value + '%');
    updateSettingsDebounced();
  }

  timeRange.addEventListener('input', () => handleSliderInput(timeRange));
  ballSpeedRange.addEventListener('input', () => handleSliderInput(ballSpeedRange));
  scoreLimitSelect.addEventListener('change', updateSettingsDebounced);
  livesInput.addEventListener('input', updateSettingsDebounced);
  
  document.getElementById("particlesToggle").addEventListener("change", updateSettingsDebounced);
  document.getElementById("paddleSoundToggle").addEventListener("change", updateSettingsDebounced);

  const langSelector = document.getElementById("language-selector");
  if (langSelector) {
    langSelector.value = getCurrentLang();
    langSelector.addEventListener("change", (event) => {
        const selectedLang = event.target.value;
        changeLanguage(selectedLang);
        localStorage.setItem("lang", selectedLang); // S'assurer qu'on stocke bien la langue
        console.log("Langue changée en :", selectedLang);
    });
  }

  
  // Charger les réglages depuis l’API
  function loadSettings() {
    console.log("loadSettings() called");
    // Appel à l'API pour charger les réglages, le token est transmis via le cookie sécurisé
    fetch("/api/game_settings/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
        // On ne fournit plus le header Authorization puisque le token est dans le cookie
      },
      credentials: "same-origin" // Permet d'envoyer les cookies avec la requête
    })
    .then(response => {
      if (response.status === 401) {
        logoutAndClearStorage();
        throw new Error("HTTP 401 - Token expiré, déconnexion en cours");
      }
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} - ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("Données récupérées :", data);
      
      // Mettre à jour les champs
      timeRange.value = parseInt(data.time);
      livesInput.value = parseInt(data.lives);
      ballSpeedRange.value = parseInt(data.ball_speed);
      scoreLimitSelect.value = data.score_limit.toString();
      
      if (scoreLimitSelect.selectedIndex === -1) {
        const fallbackOption = [...scoreLimitSelect.options].find(
          opt => parseInt(opt.textContent) === data.score_limit
        );
        if (fallbackOption) fallbackOption.selected = true;
      }
      
      document.getElementById('particlesToggle').checked = !!data.particles_enabled;
      document.getElementById('paddleSoundToggle').checked = !!data.paddle_hit_sound_enabled;

      handleSliderInput(timeRange);
      handleSliderInput(ballSpeedRange);

      // Mettre à jour la map sélectionnée depuis la BDD
      selectedMapChoice = data.map_choice || 'retro';
      console.log("Map chargée depuis l'API :", selectedMapChoice);

      mapChoiceButtons.forEach(b => b.classList.remove('active'));
      const btnFound = [...mapChoiceButtons].find(b => b.dataset.map === selectedMapChoice);
      if (btnFound) btnFound.classList.add('active');

      selectedPaddleSize = data.paddle_size || 'medium';
      paddleSizeButtons.forEach(btn => {
        const btnSize = btn.dataset.i18n.replace('paddle_size_', '').toLowerCase();
        btn.classList.toggle('active', btnSize === selectedPaddleSize);
      });

    })
    .catch(error => {
      console.error("Erreur lors de la récupération des réglages :", error);
    });
  }

  changeLanguage(getCurrentLang()); // Applique la traduction d'abord

  // Attendre un petit délai pour que le DOM soit traduit
  setTimeout(() => {
    loadSettings();
  }, 100);

}

// Initialiser la page setup
initSetupPage();
