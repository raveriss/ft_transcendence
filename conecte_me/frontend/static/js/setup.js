console.log("setup.js loaded");

// Fonction debounce pour retarder la sauvegarde
function debounce(func, delay) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

function initSetupPage() {
  console.log("initSetupPage() déclenchée");

  // Récupérer le token JWT
  const token = localStorage.getItem('jwtToken');
  console.log("Token récupéré dans setup.js:", token);

  // Récupération des éléments
  const timeRange = document.getElementById("timeRange");
  const scoreLimitSelect = document.getElementById("scoreLimitSelect");
  const livesInput = document.getElementById("livesInput");
  const ballSpeedRange = document.getElementById("ballSpeedRange");

  // Groupe de boutons pour la map
  const mapChoiceButtons = document.querySelectorAll('#mapChoiceGroup button');
  let selectedMapChoice = "retro"; // Valeur par défaut

  // On peut marquer d’emblée "retro" comme actif,
  // puis on ajustera plus tard quand on chargera la valeur depuis l’API
  mapChoiceButtons.forEach(btn => {
    if (btn.dataset.map === 'retro') {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Écouteur sur chaque bouton => active la classe "active" et met à jour selectedMapChoice
  mapChoiceButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Retirer "active" partout
      mapChoiceButtons.forEach(b => b.classList.remove('active'));
      // Activer le bouton cliqué
      btn.classList.add('active');
      // Stocker la map choisie
      selectedMapChoice = btn.dataset.map;
      console.log("Map sélectionnée :", selectedMapChoice);
      updateSettingsDebounced();
    });
  });

  // Sliders & inputs => déclenche la sauvegarde
  timeRange.addEventListener('input', () => {
    const value = (timeRange.value - timeRange.min) / (timeRange.max - timeRange.min) * 100;
    timeRange.style.setProperty('--slider-value', value + '%');
    updateSettingsDebounced();
  });
  ballSpeedRange.addEventListener('input', () => {
    const value = (ballSpeedRange.value - ballSpeedRange.min) / (ballSpeedRange.max - ballSpeedRange.min) * 100;
    ballSpeedRange.style.setProperty('--slider-value', value + '%');
    updateSettingsDebounced();
  });
  scoreLimitSelect.addEventListener('change', () => {
    updateSettingsDebounced();
  });
  livesInput.addEventListener('input', () => {
    updateSettingsDebounced();
  });

  // Charge les réglages depuis l’API
  function loadSettings() {
    console.log("loadSettings() called");
    fetch("/api/game_settings/", {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
      }
    })
    .then(response => {
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
      scoreLimitSelect.value = data.score_limit + " Points";

      // Mettre à jour l'apparence du slider TIME
      const valueTime = (timeRange.value - timeRange.min) / (timeRange.max - timeRange.min) * 100;
      timeRange.style.setProperty('--slider-value', valueTime + '%');

      // Mettre à jour l'apparence du slider ball_speed
      const valueSpeed = (ballSpeedRange.value - ballSpeedRange.min) / (ballSpeedRange.max - ballSpeedRange.min) * 100;
      ballSpeedRange.style.setProperty('--slider-value', valueSpeed + '%');

      // Mettre à jour la map sélectionnée depuis la BDD
      selectedMapChoice = data.map_choice || 'retro';
      console.log("Map chargée depuis l'API :", selectedMapChoice);

      // Retirer "active" partout
      mapChoiceButtons.forEach(b => b.classList.remove('active'));
      // Trouver le bouton correspondant
      const btnFound = Array.from(mapChoiceButtons).find(b => b.dataset.map === selectedMapChoice);
      if (btnFound) {
        btnFound.classList.add('active');
      }
    })
    .catch(error => {
      console.error("Erreur lors de la récupération des réglages :", error);
    });
  }

  // Sauvegarde via POST
  function updateSettings() {
    // Récupérer le score limit
    let scoreLimit = scoreLimitSelect.value;
    const match = scoreLimit.match(/(\d+)/);
    scoreLimit = match ? parseInt(match[1]) : parseInt(scoreLimit);

    // Construire l'objet
    const settings = {
      time: parseInt(timeRange.value),
      score_limit: scoreLimit,
      lives: parseInt(livesInput.value),
      ball_speed: parseInt(ballSpeedRange.value),
      map_choice: selectedMapChoice
    };

    console.log("Envoi du POST avec settings:", settings);

    fetch("/api/game_settings/", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(settings)
    })
    .then(response => {
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

  const updateSettingsDebounced = debounce(updateSettings, 500);

  // Charger les réglages au démarrage
  loadSettings();
}

initSetupPage();
