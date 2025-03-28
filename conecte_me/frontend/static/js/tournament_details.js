// tournament_details.js

console.log("✅ tournament_details.js loaded");

let tournamentId = null;

async function getTournamentIdFromSession() {
  const res = await fetch('/tournament/get_current_id/');
  const data = await res.json();
  if (!data.tournament_id) throw new Error("Aucun tournoi actif trouvé en session");
  return data.tournament_id;
}

async function renderTournamentDetails() {
  try {
    tournamentId = await getTournamentIdFromSession();
    const res = await fetch(`/tournament/api/details/${tournamentId}/`);
    const raw = await res.text();
    console.log("Réponse de l'API:", raw);
    const data = JSON.parse(raw);

    document.getElementById('tournament-name').textContent = data.tournament.name;

    renderBracket(data.matches);
  } catch (err) {
    console.error("❌ Impossible de charger les détails du tournoi:", err);
    alert("Erreur lors du chargement du tournoi.");
  }
}

function renderBracket(matches) {
  const container = document.getElementById('bracket-container');
  container.innerHTML = '';
  container.style.position = 'relative';

  const rounds = groupMatchesByRound(matches);
  const bracket = document.createElement('div');
  bracket.className = 'bracket-grid';
  bracket.style.display = 'flex';
  bracket.style.flexDirection = 'row';
  bracket.style.gap = '80px';
  bracket.style.position = 'relative';

  const matchCoords = {}; // Pour SVG lines

  const roundKeys = Object.keys(rounds).sort((a, b) => a - b);
  roundKeys.forEach((round, colIndex) => {
    const column = document.createElement('div');
    column.className = 'round-column';
    column.style.display = 'flex';
    column.style.flexDirection = 'column';
    column.style.alignItems = 'center';
    column.style.justifyContent = 'space-around';
    column.style.minHeight = '100vh';

    const roundTitle = document.createElement('h4');
    roundTitle.textContent = `Tour ${round}`;
    column.appendChild(roundTitle);

    rounds[round].forEach((match, rowIndex) => {
      const matchBox = document.createElement('div');
      matchBox.className = 'match-box';
      matchBox.id = `match-${match.id}`;
      matchBox.style.width = '200px';
      matchBox.style.height = '110px';
      matchBox.style.display = 'flex';
      matchBox.style.flexDirection = 'column';
      matchBox.style.justifyContent = 'space-between';
      matchBox.style.alignItems = 'center';
      matchBox.style.textAlign = 'center';
      matchBox.style.border = '2px solid #555';
      matchBox.style.borderRadius = '12px';
      matchBox.style.backgroundColor = match.winner ? '#2a2a2a' : '#222';
      matchBox.style.position = 'relative';
      matchBox.style.padding = '0.5rem';

      const p1 = document.createElement('div');
      p1.className = 'player';
      p1.textContent = match.player1 || '???';

      const p2 = document.createElement('div');
      p2.className = 'player';
      p2.textContent = match.player2 || '???';

      const winnerText = document.createElement('div');
      winnerText.className = 'score';
      winnerText.innerHTML = `Gagnant: <strong>${match.winner || 'à venir'}</strong>`;

      const playBtn = document.createElement('button');
      playBtn.className = 'play-btn btn-centered';
      playBtn.textContent = '▶';
      if (match.winner) playBtn.disabled = true;
      playBtn.addEventListener('click', () => playMatch(match.id));

      matchBox.appendChild(p1);
      matchBox.appendChild(playBtn);
      matchBox.appendChild(p2);
      matchBox.appendChild(winnerText);

      column.appendChild(matchBox);
      matchCoords[match.id] = matchBox; // Store for SVG
    });

    bracket.appendChild(column);
  });

  container.appendChild(bracket);

  // SVG Lines
  drawConnections(rounds, matchCoords);

  // Affichage gagnant
  const winnerMatch = matches.find(m => m.round === roundKeys.length && m.winner);
  if (winnerMatch) {
    const winnerBanner = document.createElement('div');
    winnerBanner.className = 'winner-banner';
    winnerBanner.textContent = `🏆 Vainqueur: ${winnerMatch.winner}`;
    container.appendChild(winnerBanner);
  }
}

function drawConnections(rounds, matchCoords) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "bracket-lines");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  svg.style.position = 'absolute';
  svg.style.top = 0;
  svg.style.left = 0;
  svg.style.zIndex = 1;
  svg.style.pointerEvents = 'none';

  Object.keys(rounds).forEach((round) => {
    const matches = rounds[round];
    matches.forEach((match) => {
      const box = matchCoords[match.id];
      if (!box || !match.winner) return;

      const nextRound = parseInt(round) + 1;
      const nextMatch = Object.values(rounds[nextRound] || []).find(m => {
        return m.player1 === match.winner || m.player2 === match.winner;
      });

      if (!nextMatch) return;

      const from = box.getBoundingClientRect();
      const toBox = matchCoords[nextMatch.id];
      if (!toBox) return;
      const to = toBox.getBoundingClientRect();

      const svgRect = svg.getBoundingClientRect();

      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", from.right - svgRect.left);
      line.setAttribute("y1", from.top + from.height / 2 - svgRect.top);
      line.setAttribute("x2", to.left - svgRect.left);
      line.setAttribute("y2", to.top + to.height / 2 - svgRect.top);
      line.setAttribute("stroke", "#4caf50");
      line.setAttribute("stroke-width", "2");

      svg.appendChild(line);
    });
  });

  document.getElementById('bracket-container').appendChild(svg);
}

function groupMatchesByRound(matches) {
  const grouped = {};
  matches.forEach(match => {
    if (!grouped[match.round]) grouped[match.round] = [];
    grouped[match.round].push(match);
  });
  return grouped;
}

function playMatch(matchId) {
  fetch(`/tournament/${tournamentId}/play_next/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]')?.value || ''
    }
  })
    .then(res => res.json())
    .then(data => {
      if (data.player1 && data.player2) {
        window.location.replace("/game-tournament");
      } else {
        alert(data.message || "Match introuvable.");
      }
    })
    .catch(err => {
      console.error("❌ Erreur lancement match:", err);
      alert("Erreur lancement match.");
    });
}

document.addEventListener("DOMContentLoaded", () => {
  renderTournamentDetails();
});