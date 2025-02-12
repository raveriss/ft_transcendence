document.addEventListener("DOMContentLoaded", function() {
  const playerCountSelect = document.getElementById("player-count");
  const playersContainer = document.getElementById("players-container");
  const tournamentForm = document.getElementById("tournament-form");

  // Met à jour les champs des pseudos en fonction du nombre de joueurs
  function updatePlayerFields() {
    const playerCount = parseInt(playerCountSelect.value, 10);
    playersContainer.innerHTML = ''; // Réinitialise les champs précédents

    for (let i = 0; i < playerCount; i++) {
      const playerField = document.createElement('div');
      playerField.classList.add('form-group');
      playerField.innerHTML = `
        <label for="player-${i + 1}">Pseudo du joueur ${i + 1} :</label>
        <input type="text" id="player-${i + 1}" required>
      `;
      playersContainer.appendChild(playerField);
    }
  }

  // Met à jour les champs de pseudo dès que le nombre de joueurs change
  playerCountSelect.addEventListener("change", updatePlayerFields);
  updatePlayerFields(); // Initialisation lors du chargement de la page

  tournamentForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const tournamentName = document.getElementById("tournament-name").value;
    const playerCount = parseInt(playerCountSelect.value, 10);
    let players = [];

    // Récupère les pseudos des joueurs
    for (let i = 0; i < playerCount; i++) {
      const playerName = document.getElementById(`player-${i + 1}`).value.trim();
      if (!playerName) {
        return alert(`Veuillez entrer un pseudo pour le joueur ${i + 1}.`);
      }
      players.push(playerName);
    }

    // Envoie les données du tournoi à l'API
    fetch("/tournament", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: tournamentName, players })
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        alert("Erreur : " + data.error);
      } else {
        alert("Tournoi créé avec succès !");
        window.location.href = `/tournament/${data.id}`;
      }
    })
    .catch(error => console.error("Erreur:", error));
  });
});