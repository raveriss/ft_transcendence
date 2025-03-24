(function() {
  console.log("Chargement de board.js");

  // Récupérer le token JWT depuis l'URL (s'il existe) et le stocker
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('jwt');
  if (token) {
    localStorage.setItem('jwtToken', token);
    console.log("Token stocké:", token);
  } else {
    console.log("Pas de token JWT dans l'URL");
  }

  // Appliquer les traductions et charger l'historique & le leaderboard
  const storedLang = getCurrentLang();
  loadTranslations(storedLang, () => {
    console.log("🔹 Traductions appliquées après navigation :", storedLang);
  });

  // Toujours mettre à jour le username depuis l'API
  fetch("/api/game_settings/", {
    method: "GET",
    headers: {
      "Authorization": "Bearer " + localStorage.getItem('jwtToken'),
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
    if (data.username) {
      localStorage.setItem('username', data.username);
      console.log("Username stocké:", data.username);
    }
    loadLeaderboard();
  })
  .catch(error => console.error("Erreur lors de la récupération des réglages :", error));

  loadMatchHistory();

  function loadMatchHistory() {
    console.log("Fonction historique des matchs");
    const token = localStorage.getItem('jwtToken');
    fetch('/api/game_settings/match_history/list/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      cache: 'no-cache'
    })
    .then(response => {
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
    const token = localStorage.getItem('jwtToken');
    const currentUser = localStorage.getItem('username') || '';
    console.log("currentUser =", currentUser);
    
    fetch('/api/game_settings/leaderboard/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      cache: 'no-cache'
    })
    .then(response => {
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
})();