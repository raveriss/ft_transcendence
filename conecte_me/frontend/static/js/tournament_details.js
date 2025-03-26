console.log("✅ tournament_details.js loaded");

window.renderTournamentDetails = function () {
  const tournamentId = localStorage.getItem("currentTournamentId");
  if (!tournamentId) {
    alert("Aucun tournoi sélectionné.");
    return;
  }

  fetch(`/tournament/${tournamentId}/details/`)
    .then((res) => res.json())
    .then((data) => {
      console.log("🎯 Données du tournoi :", data);

      document.getElementById("tournamentName").textContent = data.name;

      if (data.winner) {
        document.getElementById("winnerDisplay").textContent = data.winner;
      }

      const playersUl = document.getElementById("playerList");
      playersUl.innerHTML = "";
      data.players.forEach((nickname) => {
        const li = document.createElement("li");
        li.textContent = nickname;
        playersUl.appendChild(li);
      });

      const upcomingUl = document.getElementById("upcomingMatches");
      const playedUl = document.getElementById("playedMatches");
      upcomingUl.innerHTML = "";
      playedUl.innerHTML = "";

      data.matches.forEach((match) => {
        const li = document.createElement("li");
        li.textContent = `${match.player1} vs ${match.player2} (Tour ${match.round})`;

        if (match.is_finished) {
          li.textContent += match.winner ? ` - Gagnant: ${match.winner}` : "";
          playedUl.appendChild(li);
        } else {
          upcomingUl.appendChild(li);
        }
      });
    })
    .catch((err) => {
      console.error("Erreur lors du chargement des détails:", err);
      alert("Erreur lors du chargement des détails du tournoi.");
    });

  const btn = document.getElementById("playNextMatchButton");
  if (btn) {
    btn.addEventListener("click", () => {
      fetch(`/tournament/${tournamentId}/play_next/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": document.querySelector('[name=csrfmiddlewaretoken]')?.value || "",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.player1 && data.player2) {
            localStorage.setItem("player1", data.player1);
            localStorage.setItem("player2", data.player2);
            localStorage.setItem("currentMatchId", data.match_id);
            navigateTo("/game-tournament");
          } else if (data.message) {
            alert(data.message);
          } else {
            alert("Erreur: " + (data.error || "inconnue"));
          }
        })
        .catch((err) => {
          console.error("Erreur lors du match:", err);
          alert("Erreur lors du lancement du match");
        });
    });
  }
};
