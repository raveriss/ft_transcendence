document.addEventListener('DOMContentLoaded', () => {
  const playBtn = document.getElementById('play-btn');

  playBtn.addEventListener('click', () => {
      console.log("🔄 Chargement de la liste des joueurs...");

      // Récupérer la liste des joueurs disponibles
      fetch('https://localhost:8443/api/user/')
          .then(response => response.json())
          .then(users => {
              const selectedOpponent = promptUserSelection(users);
              if (selectedOpponent) {
                  console.log(`✅ Adversaire choisi : ${selectedOpponent.username}`);

                  // Rediriger vers le jeu avec les noms du joueur et de l'adversaire
                  const playerName = "Vous"; // Le joueur actuel
                  const opponentName = selectedOpponent.username;
                  window.location.href = `pong_game.html?player=${encodeURIComponent(playerName)}&opponent=${encodeURIComponent(opponentName)}`;
              } else {
                  alert("⚠️ Aucun adversaire sélectionné !");
              }
          })
          .catch(error => {
              console.error("❌ Erreur lors de la récupération des joueurs :", error);
              alert("Impossible de récupérer la liste des joueurs.");
          });
  });

  function promptUserSelection(users) {
      let message = "Sélectionnez un adversaire (entrez l'ID) :\n";
      users.forEach(user => {
          message += `${user.id}: ${user.username}\n`;
      });

      const choice = prompt(message);
      return users.find(user => user.id === parseInt(choice)) || null;
  }
});
