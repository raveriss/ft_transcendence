if (typeof csrfToken === 'undefined') {
	var csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
}

document.addEventListener("DOMContentLoaded", () => {
	loadExistingTournaments();
});

// 🟦 Génère dynamiquement les champs joueurs
function generatePlayerFields() {
	const numPlayers = document.getElementById("numPlayers").value;
	const playersContainer = document.getElementById("playersContainer");
	playersContainer.innerHTML = "";

	if (numPlayers >= 2) {
		if (numPlayers % 2 !== 0) {
			alert("Le nombre de joueurs doit être pair pour créer un tournoi.");
			return;
		}
		for (let i = 1; i <= numPlayers; i++) {
			const label = document.createElement("label");
			label.classList.add("form-label");
			label.setAttribute("for", `player${i}`);
			label.textContent = `Pseudo joueur ${i}`;

			const input = document.createElement("input");
			input.type = "text";
			input.classList.add("form-control", "mb-2");
			input.id = `player${i}`;
			input.name = `player${i}`;
			input.required = true;

			playersContainer.appendChild(label);
			playersContainer.appendChild(input);
		}
	}
}

// ✅ Vérifie que tous les pseudos joueurs sont remplis
function validatePlayerNicknames(numPlayers) {
	for (let i = 1; i <= numPlayers; i++) {
		const input = document.getElementById(`player${i}`);
		if (!input.value.trim()) {
			alert(`Le champ "Pseudo joueur ${i}" est vide.`);
			input.focus();
			return false;
		}
	}
	return true;
}

// 🟩 Créer un tournoi et envoyer au backend
function createTournament() {
	const tournamentName = document.getElementById("tournamentName").value.trim();
	const numPlayers = parseInt(document.getElementById("numPlayers").value);

	if (!tournamentName) {
		alert("Le nom du tournoi est requis.");
		document.getElementById("tournamentName").focus();
		return;
	}

	if (isNaN(numPlayers) || numPlayers < 2 || numPlayers % 2 !== 0) {
		alert("Veuillez saisir un nombre pair de joueurs (au moins 2).");
		document.getElementById("numPlayers").focus();
		return;
	}

	if (!validatePlayerNicknames(numPlayers)) {
		return;
	}

	const playerNicknames = [];
	for (let i = 1; i <= numPlayers; i++) {
		const nickname = document.getElementById(`player${i}`).value.trim();
		playerNicknames.push(nickname);
	}

	const gameSettings = {
		time: parseInt(document.getElementById("gameTime").value, 10),
		score_limit: parseInt(document.getElementById("scoreLimit").value, 10)
	};

	if (isNaN(gameSettings.time) || isNaN(gameSettings.score_limit)) {
		alert("Les paramètres de temps et de score sont requis.");
		return;
	}

	const tournamentData = {
		name: tournamentName,
		num_players: numPlayers,
		player_nicknames: playerNicknames,
		game_settings: gameSettings
	};

	fetch("/tournament/create/", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			'X-CSRFToken': csrfToken
		},
		body: JSON.stringify(tournamentData),
	})
	.then(async response => {
		const text = await response.text();
		if (!response.ok) throw new Error(`Erreur HTTP ${response.status}: ${text}`);
		return JSON.parse(text);
	})
	.then(data => {
		if (data.tournament?.id) {
			const currentTournamentId = data.tournament.id;
			displayTournamentDetails(data);
			localStorage.setItem("gameSettings", JSON.stringify({
				score_limit: data.tournament.score_limit,
				time: data.tournament.time
			}));
			localStorage.setItem("currentTournamentId", currentTournamentId);
			window.navigateTo('/tournament-details');
		} else {
			alert("Erreur: " + data.error);
		}
	})
	.catch(error => {
		console.error("Erreur:", error);
		alert("Erreur lors de la création du tournoi.");
	});
}

// 🔄 Affiche les données du tournoi après création
function displayTournamentDetails(data) {
	const nameDisplay = document.getElementById("tournamentNameDisplay");
	if (nameDisplay) {
		nameDisplay.textContent = `Tournoi: ${data.tournament.name}`;
	}
}

// 🔁 Chargement des tournois existants
function loadExistingTournaments() {
	const apiUrl = `${window.location.origin}/tournament/list/`;

	fetch(apiUrl)
		.then(response => {
			console.log("✅ Réponse brute de /tournament/list/ :", response);
			return response.json();
		})
		.then(data => {
			console.log("✅ Données JSON :", data);
			const select = document.getElementById("tournamentSelect");
			select.innerHTML = '<option value="">-- Sélectionner un tournoi --</option>';

			data.tournaments.forEach(t => {
				const option = document.createElement("option");
				const winnerText = t.winner ? ` - Vainqueur: ${t.winner}` : "";
				option.value = t.id;
				option.textContent = `${t.name}${winnerText}`;
				select.appendChild(option);
			});
		})
		.catch(err => {
			console.error("❌ Erreur chargement tournois :", err);
		});
}

// 🔁 Rejoindre un tournoi existant
function joinSelectedTournament() {
	const selectedId = document.getElementById("tournamentSelect").value;
	if (!selectedId) {
		alert("Veuillez sélectionner un tournoi.");
		return;
	}

	fetch("/tournament/set_current_id/", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"X-CSRFToken": csrfToken
		},
		body: JSON.stringify({ tournament_id: selectedId })
	})
	.then(response => {
		if (!response.ok) throw new Error("Erreur lors de la sélection");
		return response.json();
	})
	.then(data => {
		window.navigateTo('/tournament-details');
	})
	.catch(error => {
		console.error("Erreur:", error);
		alert("Impossible de rejoindre le tournoi.");
	});
}

function initTournamentPage() {
	loadExistingTournaments();
}
