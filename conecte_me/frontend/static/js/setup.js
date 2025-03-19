console.log("setup.js loaded");

// Fonction debounce
function debounce(func, delay) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

// Fonction globale initSetupPage() pour initialiser la page setup
function initSetupPage() {
  console.log("initSetupPage() déclenchée");

  // Récupérer le token stocké (mis dans localStorage au moment de /board)
  const token = localStorage.getItem('jwtToken');
  console.log("Token récupéré dans setup.js:", token);

  // Sélection des sliders
  const sliders = document.querySelectorAll('.form-range');
  sliders.forEach(slider => {
    slider.addEventListener('input', function() {
      const value = (this.value - this.min) / (this.max - this.min) * 100;
      this.style.setProperty('--slider-value', value + '%');
      updateSettingsDebounced(); // sauvegarde auto
    });
    const initialValue = (slider.value - slider.min) / (slider.max - slider.min) * 100;
    slider.style.setProperty('--slider-value', initialValue + '%');
  });

  // Récupération des éléments
  const timeRange = document.getElementById("timeRange");
  const scoreLimitSelect = document.getElementById("scoreLimitSelect");
  const livesInput = document.getElementById("livesInput");
  const ballSpeedRange = document.getElementById("ballSpeedRange");

  // Fonction pour charger les réglages via l'API
  function loadSettings() {
    console.log("loadSettings() called");

    fetch("/api/game_settings/", {
      method: "GET",
      headers: {
        // On inclut le token
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
      }
      // --> On retire credentials: 'include'
    })
    .then(response => {
      // On peut vérifier si la réponse est OK ou non
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} - ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("Données récupérées :", data);
      // Mettre à jour les champs avec les valeurs récupérées
      timeRange.value = parseInt(data.time);
      scoreLimitSelect.value = data.score_limit + " Points";
      livesInput.value = data.lives;
      ballSpeedRange.value = data.ball_speed;
      // Mettre à jour l'apparence du slider timeRange
      const valueTime = (timeRange.value - timeRange.min) / (timeRange.max - timeRange.min) * 100;
      timeRange.style.setProperty('--slider-value', valueTime + '%');
      console.log("timeRange.value après update :", timeRange.value);
    })
    .catch(error => {
      console.error("Erreur lors de la récupération des réglages :", error);
    });
  }

  // Fonction pour sauvegarder
  function updateSettings() {
    let scoreLimit = scoreLimitSelect.value;
    const match = scoreLimit.match(/(\d+)/);
    scoreLimit = match ? parseInt(match[1]) : parseInt(scoreLimit);

    const settings = {
      time: parseInt(timeRange.value),
      score_limit: scoreLimit,
      lives: parseInt(livesInput.value),
      ball_speed: parseInt(ballSpeedRange.value)
    };

    console.log("Envoi du POST avec settings:", settings);
    fetch("/api/game_settings/", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + token,   // On place le token ici aussi
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

// Appel direct pour initialiser
initSetupPage();
