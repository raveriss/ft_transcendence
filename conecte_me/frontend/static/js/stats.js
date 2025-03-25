(function() {
    console.log("Stats.js loaded");
  
    function loadUserStatsForStatsPage() {
      console.log("loadUserStatsForStatsPage called");
      const token = localStorage.getItem('jwtToken');
      console.log("Token in stats page:", token);
      fetch('/api/game_settings/user_stats/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} - ${response.statusText}`);
        }
        return response.json();
      })
      .then(stats => {
        console.log("User stats retrieved:", stats);
        // Calcul du win rate en pourcentage
        const totalGames = stats.total_games;
        const wins = stats.wins;
        const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) + '%' : '0%';

        // Mise à jour des éléments de la page stats.html
        document.getElementById('win-rate').textContent = winRate;
        document.getElementById('win-streak').textContent = stats.win_streak;
        // Affichage de la durée moyenne en minutes avec deux décimales
        document.getElementById('avg-duration').textContent = (stats.avg_duration / 60).toFixed(2) + ' min';
        document.getElementById('week_win').textContent = stats.rank_progress;
    })
      .catch(error => {
        console.error("Erreur lors du chargement des stats utilisateur pour la page stats:", error);
      });
    }
    function loadAllMatchHistory() {
        console.log("loadAllMatchHistory called");
        const token = localStorage.getItem('jwtToken');
        fetch('/api/game_settings/match_history/all/', {
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
            console.log("All match history retrieved:", matches);
            const tbody = document.getElementById('match-history-all');
            if (!tbody) {
                console.error("Element with id 'match-history-all' not found");
                return;
            }
            tbody.innerHTML = '';
            matches.forEach(match => {
                const dateStr = new Date(match.match_date).toLocaleDateString();
                const adversary = match.player2;
                const score = `${match.score1}-${match.score2}`;
                const duration = match.duration + " sec";
                // Elo reste fixé à 0 pour l'instant
                const elo = 0;
        
                const row = `
                  <tr>
                    <td>${dateStr}</td>
                    <td>${adversary}</td>
                    <td>${score}</td>
                    <td>${duration}</td>
                    <td>${elo}</td>
                  </tr>
                `;
                tbody.insertAdjacentHTML('beforeend', row);
            });
        })
        .catch(error => {
            console.error("Erreur lors du chargement de l'historique complet des matchs:", error);
        });
    }
    loadUserStatsForStatsPage();
    loadAllMatchHistory();
})();
  