console.log("✅ tournament_details.js loaded");

if (typeof tournamentId === 'undefined') {
  var tournamentId = null;
}

async function getTournamentIdFromSession() {
  const res = await fetch('/tournament/get_current_id/', {credentials: "same-origin"});
  const data = await res.json();
  if (!data.tournament_id) throw new Error("Aucun tournoi actif trouvé en session");
  return data.tournament_id;
}

async function renderTournamentDetails() {
  try {
    tournamentId = await getTournamentIdFromSession();
    const res = await fetch(`/tournament/api/details/${tournamentId}/`, {credentials: "same-origin"});
    const raw = await res.text();
    console.log("Réponse de l'API:", raw);
    const data = JSON.parse(raw);

    const titleEl = document.getElementById('tournamentTitle');
    if (titleEl) titleEl.textContent = data.tournament.name;

    renderBracket(data.matches);
	sessionStorage.removeItem("matchJustPlayed");
  } catch (err) {
    console.error("❌ Impossible de charger les détails du tournoi:", err);
	alert(t("tournament_load_error"));
	window.history.back();
}
}

function renderBracket(matches) {
	const container = document.getElementById('bracketContainer');
	container.innerHTML = '';
	container.style.position = 'relative';
  
	const rounds = groupMatchesByRound(matches);
	const roundKeys = Object.keys(rounds).sort((a, b) => a - b);
	const baseMatchCount = rounds[roundKeys[0]].length;
  
	const MATCH_HEIGHT = 120;
	const VERTICAL_SPACING = 40;
	const minColHeight = baseMatchCount * (MATCH_HEIGHT + VERTICAL_SPACING);
  
	const bracket = document.createElement('div');
	bracket.className = 'bracket-grid';
	bracket.style.display = 'flex';
	bracket.style.flexDirection = 'row';
	bracket.style.gap = '60px';
	bracket.style.overflowX = 'auto';
	bracket.style.padding = '1rem';
	bracket.style.position = 'relative';
	bracket.style.width = '100%';
  
	const matchCoords = {};
  
	roundKeys.forEach((roundKey, roundIndex) => {
	  const round = rounds[roundKey];
	  const column = document.createElement('div');
	  column.className = 'round-column';
	  column.style.display = 'flex';
	  column.style.flexDirection = 'column';
	  column.style.alignItems = 'center';
	  column.style.position = 'relative';
	  column.style.minHeight = `${minColHeight}px`;
  
	  const roundTitle = document.createElement('h4');
	  roundTitle.textContent = `${t("round")} ${roundKey}`;
	  roundTitle.style.color = '#60a5fa';
	  roundTitle.style.fontFamily = 'Pong-Game, sans-serif';
	  column.appendChild(roundTitle);
  
	  const totalSpace = minColHeight - round.length * MATCH_HEIGHT;
	  const spacing = totalSpace / (round.length + 1);
  
	  round.forEach((match, index) => {
		const matchBox = document.createElement('div');
		matchBox.className = 'match-box';
		matchBox.id = `match-${match.id}`;
		matchBox.style.marginTop = `${spacing}px`;
  
		const p1 = document.createElement('div');
		p1.className = 'player';
		p1.textContent = match.player1 || '???';
  
		const p2 = document.createElement('div');
		p2.className = 'player';
		p2.textContent = match.player2 || '???';
  
		const winnerText = document.createElement('div');
		winnerText.className = 'score';
		winnerText.innerHTML = `<span style="color:#cbd5e1;">${t("winner")}:</span> <strong>${match.winner || t("upcoming")}</strong>`;
  
		const playBtn = document.createElement('button');
		playBtn.className = 'play-btn btn-centered';
		playBtn.textContent = '▶';
  
		if (match.winner) {
		  playBtn.disabled = true;
		  playBtn.style.opacity = 0.3;
		} else {
		  playBtn.addEventListener('click', () => launchGame(match));
		}
  
		matchBox.appendChild(p1);
		matchBox.appendChild(playBtn);
		matchBox.appendChild(p2);
		matchBox.appendChild(winnerText);
  
		column.appendChild(matchBox);
		matchCoords[match.id] = matchBox;
	  });
  
	  bracket.appendChild(column);
	});
  
	container.appendChild(bracket);
	drawConnections(rounds, matchCoords);
  
	const winnerMatch = matches.find(m => m.round === roundKeys.length && m.winner);
	if (winnerMatch) {
	  const winnerBanner = document.createElement('div');
	  winnerBanner.className = 'winner-banner';
	  winnerBanner.textContent = `🏆 ${t("winner")}: ${winnerMatch.winner}`;
	  winnerBanner.style.marginTop = '1rem';
	  winnerBanner.style.textAlign = 'center';
	  winnerBanner.style.fontSize = '1.2rem';
	  winnerBanner.style.color = '#22c55e';
	  winnerBanner.style.fontWeight = 'bold';
  
	  bracket.lastChild.appendChild(winnerBanner);
	}
  }
  

function launchGame(match) {
  localStorage.setItem("currentMatch", JSON.stringify({
    match_id: match.id,
    player1: match.player1,
    player2: match.player2,
    tournament_id: tournamentId
  }));
  	sessionStorage.setItem("matchJustPlayed", "false");
	navigateTo('/game-tournament', true);
	
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
  
	const svgRect = document.getElementById("bracketContainer").getBoundingClientRect();
  
	Object.keys(rounds).forEach(round => {
	  const matches = rounds[round];
	  matches.forEach(match => {
		const fromBox = matchCoords[match.id];
		if (!fromBox || !match.winner) return;
  
		const nextRound = parseInt(round) + 1;
		const nextMatch = (rounds[nextRound] || []).find(
		  m => m.player1 === match.winner || m.player2 === match.winner
		);
  
		if (!nextMatch) return;
  
		const toBox = matchCoords[nextMatch.id];
		if (!toBox) return;
  
		const from = fromBox.getBoundingClientRect();
		const to = toBox.getBoundingClientRect();
  
		const x1 = from.right - svgRect.left;
		const y1 = from.top + from.height / 2 - svgRect.top;
		const x2 = to.left - svgRect.left;
		const y2 = to.top + to.height / 2 - svgRect.top;
		const midX = (x1 + x2) / 2;
  
		const line1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
		line1.setAttribute("x1", x1);
		line1.setAttribute("y1", y1);
		line1.setAttribute("x2", midX);
		line1.setAttribute("y2", y1);
		line1.setAttribute("stroke", "#3b82f6");
		line1.setAttribute("stroke-width", "2");
		svg.appendChild(line1);
  
		const line2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
		line2.setAttribute("x1", midX);
		line2.setAttribute("y1", y1);
		line2.setAttribute("x2", midX);
		line2.setAttribute("y2", y2);
		line2.setAttribute("stroke", "#3b82f6");
		line2.setAttribute("stroke-width", "2");
		svg.appendChild(line2);
  
		const line3 = document.createElementNS("http://www.w3.org/2000/svg", "line");
		line3.setAttribute("x1", midX);
		line3.setAttribute("y1", y2);
		line3.setAttribute("x2", x2);
		line3.setAttribute("y2", y2);
		line3.setAttribute("stroke", "#3b82f6");
		line3.setAttribute("stroke-width", "2");
		svg.appendChild(line3);
	  });
	});
  
	document.getElementById('bracketContainer').appendChild(svg);
  }
  

function groupMatchesByRound(matches) {
  const grouped = {};
  matches.forEach(match => {
    if (!grouped[match.round]) grouped[match.round] = [];
    grouped[match.round].push(match);
  });

  //trier par id croissant
  Object.keys(grouped).forEach(round => {
    grouped[round].sort((a, b) => a.id - b.id);
  });
  return grouped;
}

window.addEventListener("popstate", function (event) {
	const matchJustPlayed = sessionStorage.getItem("matchJustPlayed") === "true";
	if (matchJustPlayed) {
		alert("⛔ Vous ne pouvez pas revenir à un match terminé.");
		history.go(1);
	}
});


document.addEventListener("DOMContentLoaded", () => {
  renderTournamentDetails();
});
