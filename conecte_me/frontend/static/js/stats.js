(function() {
    console.log("Stats.js loaded");
  
    function loadUserStatsForStatsPage() {
      console.log("loadUserStatsForStatsPage called");
      // Le token n'est plus récupéré depuis le localStorage, car il est transmis via un cookie sécurisé.
      fetch('/api/game_settings/user_stats/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
          // Pas besoin d'ajouter l'en-tête Authorization, le cookie sécurisé est envoyé automatiquement.
        },
        credentials: 'same-origin' // Permet d'envoyer les cookies avec la requête pour le domaine courant.
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
      .then(stats => {
        console.log("User stats retrieved:", stats);
        // Calcul du win rate en pourcentage
        const totalGames = stats.total_games;
        const wins = stats.wins;
        const losses = stats.losses;
        const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) + '%' : '0%';

        // Mise à jour des éléments de la page stats.html
        document.getElementById('win-rate').textContent = winRate;
        document.getElementById('win-streak').textContent = stats.win_streak;
        // Affichage de la durée moyenne en minutes avec deux décimales
        document.getElementById('avg-duration').textContent = (stats.avg_duration / 60).toFixed(2) + ' ' + t("minutes_short");
        document.getElementById('week_win').textContent = stats.rank_progress;
    
        // Construire le camembert Wins vs Losses
        buildWinsLossesPie(wins, losses);
      })
      .catch(error => {
        console.error("Erreur lors du chargement des stats utilisateur pour la page stats:", error);
      });
    }
    // 2) Construit le camembert (Wins vs. Losses)
    function buildWinsLossesPie(wins, losses) {
      console.log("[stats.js] buildWinsLossesPie:", { wins, losses });
      const ctx = document.getElementById('winsModeChart');
      if (!ctx) {
        console.warn("winsModeChart canvas introuvable");
        return;
      }
      // Créer le chart via Chart.js
      new Chart(ctx, {
        type: 'pie',
        data: {
          labels: [t("wins_label"), t("losses_label")],
          datasets: [{
            label: 'Stats 1v1',
            data: [wins, losses],
            backgroundColor: ['#36A2EB', '#FF6384'],
          }]
        },
        options: {
          responsive: true,
          // Indispensable pour s’adapter au conteneur 300×220
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            },
            title: {
              display: true,
              text: t("win_loss_pie_title")
            }
          }
        }
      });
    }

    function loadAllMatchHistory() {
        console.log("loadAllMatchHistory called");
        fetch('/api/game_settings/match_history/all/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'same-origin', // Permet d'envoyer les cookies avec la requête pour le même domaine
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
                const duration = match.duration + ' ' + t("seconds_short");
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
  