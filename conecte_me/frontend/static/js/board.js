(function() {
  console.log("Chargement de board.js");

  // Appliquer les traductions et charger l'historique & le leaderboard
  const storedLang = getCurrentLang();
  loadTranslations(storedLang, () => {
    console.log("🔹 Traductions appliquées après navigation :", storedLang);
  });

  // Toujours mettre à jour le username depuis l'API sans ajouter manuellement le token
  fetch("/api/game_settings/", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
    // Permet d'envoyer les cookies avec la requête (si le domaine est identique)
    credentials: "same-origin"
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
    if (data.id) {
      sessionStorage.setItem('settings_id', data.id);
      console.log("GameSettings id enregistre en session :", data.id);
    } else {
      console.log("Aucun id reçu dans les réglages.");
    }
    loadLeaderboard();
  })
  .catch(error => console.error("Erreur lors de la récupération des réglages :", error));

  loadMatchHistory();

  function loadMatchHistory() {
    console.log("Fonction historique des matchs");
    // Le token n'est plus récupéré depuis le localStorage,
    fetch('/api/game_settings/match_history/list/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
        // Pas besoin d'ajouter l'en-tête Authorization.
      },
      credentials: 'same-origin', // Permet d'envoyer les cookies avec la requête
      cache: 'no-cache'
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
    .then(matches => {
      console.log("Historique des matchs récupéré :", matches);
      const historyList = document.getElementById('match-history-list');
      if (!historyList) {
        console.error("Élément #match-history-list non trouvé.");
        return;
      }
      historyList.innerHTML = '';
      matches.forEach(match => {
        const matchDate = new Date(match.match_date).toISOString().slice(0, 10);
        const isVictory = match.score1 > match.score2;
        const resultText = isVictory ? `Victory ${match.score1}-${match.score2}` : `Defeat ${match.score1}-${match.score2}`;
        const resultClass = isVictory ? "text-success" : "text-danger";
        const li = document.createElement('li');
        li.classList.add('list-group-item-custom');
        li.innerHTML = `
          <div class="match-info-left">
            <span class="match-date">${matchDate}</span>
            <span class="match-name">${match.player1} vs ${match.player2}</span>
          </div>
          <span class="match-result ${resultClass}">${resultText}</span>
        `;
        historyList.appendChild(li);
      });
    })
    .catch(error => {
      console.error("Erreur lors du chargement de l'historique des matchs :", error);
    });
  }

  function loadLeaderboard() {
    fetch('/api/game_settings/leaderboard/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
        // L'en-tête Authorization n'est plus nécessaire.
      },
      credentials: 'same-origin', // Assure que le cookie est inclus dans la requête
      cache: 'no-cache'
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
    .then(leaderboard => {
      console.log("Classement récupéré :", leaderboard);
      const leaderboardTableBody = document.getElementById('leaderboard-body');
      if (!leaderboardTableBody) {
        console.error("Tableau du leaderboard introuvable");
        return;
      }
      leaderboardTableBody.innerHTML = '';
      
      leaderboard.forEach(entry => {
        const tr = document.createElement('tr');
        // Pas de surbrillance, on affiche simplement chaque entrée
        const rankTd = document.createElement('td');
        rankTd.classList.add('rank-cell');
        rankTd.textContent = `#${entry.rank}`;
        
        const nameTd = document.createElement('td');
        nameTd.classList.add('player-name-cell');
        nameTd.textContent = entry.username ? entry.username : entry.player1;
        
        const winsTd = document.createElement('td');
        winsTd.classList.add('wins-cell');
        winsTd.innerHTML = `${entry.win_count} <span data-i18n="wins">wins</span>`;
        
        tr.appendChild(rankTd);
        tr.appendChild(nameTd);
        tr.appendChild(winsTd);
        
        leaderboardTableBody.appendChild(tr);
      });
    })
    .catch(error => {
      console.error("Erreur lors du chargement du leaderboard :", error);
    });
  }
	// Redirection vers /tournament quand on clique sur l'icône trophée
	document.querySelectorAll('.icon-circle').forEach(circle => {
	  circle.addEventListener('click', function () {
		const mode = this.dataset.mode;
		if (mode === 'tournament') {
		  window.navigateTo('/tournament');
		}
	  });
	});
 })();
 