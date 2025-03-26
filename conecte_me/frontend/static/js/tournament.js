var csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

function generatePlayerFields() {
    const numPlayers = document.getElementById("numPlayers").value;
    const playersContainer = document.getElementById("playersContainer");
    playersContainer.innerHTML = "";

    if (numPlayers >= 2) {
        for (let i = 1; i <= numPlayers; i++) {
            const label = document.createElement("label");
            label.classList.add("form-label");
            label.setAttribute("for", `player${i}`);
            label.textContent = `Pseudo joueur ${i}`;

            const input = document.createElement("input");
            input.type = "text";
            input.classList.add("form-control");
            input.id = `player${i}`;
            input.name = `player${i}`;
            input.required = true;

            playersContainer.appendChild(label);
            playersContainer.appendChild(input);
            playersContainer.appendChild(document.createElement("br"));
        }
    }
}

function createTournament() {
    const tournamentName = document.getElementById("tournamentName").value;
    const numPlayers = parseInt(document.getElementById("numPlayers").value);
    const playerNicknames = [];

    for (let i = 1; i <= numPlayers; i++) {
        const playerNickname = document.getElementById(`player${i}`).value;
        playerNicknames.push(playerNickname);
    }

    const time = parseInt(document.getElementById("gameTime").value, 10);
    const scoreLimit = parseInt(document.getElementById("scoreLimit").value, 10);

    const gameSettings = {
        time: time,
        score_limit: scoreLimit
    };

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
        console.log("Réponse brute du serveur :", text);

        try {
            const data = JSON.parse(text);

            if (data.message) {
                currentTournamentId = data.tournament_id;
                document.getElementById("tournamentNameDisplay").textContent = `Tournoi: ${data.message}`;

                const playerList = document.getElementById("playerList");
                playerList.innerHTML = "";
                data.players.forEach(player => {
                    const listItem = document.createElement("li");
                    listItem.textContent = player;
                    playerList.appendChild(listItem);
                });

                const matchList = document.getElementById("matchList");
                matchList.innerHTML = "";
                data.matches.forEach(match => {
                    const matchItem = document.createElement("li");
                    matchItem.textContent = `${match.player1_nickname} vs ${match.player2_nickname} (Tour: ${match.round})`;
                    matchList.appendChild(matchItem);
                });

                localStorage.setItem("gameSettings", JSON.stringify(gameSettings));
                localStorage.setItem("currentTournamentId", currentTournamentId);
				navigateTo('/tournament-details');

            } else {
                alert("Erreur: " + data.error);
            }

        } catch (e) {
            console.error("Erreur JSON:", e);
            alert("Réponse invalide du serveur (voir console)");
        }
    })
    .catch(error => {
        alert("Erreur lors de la création du tournoi: " + error);
    });
}

// function playNextMatch() {
//     if (!currentTournamentId) {
//         alert("Aucun tournoi sélectionné.");
//         return;
//     }

//     fetch(`/tournament/${currentTournamentId}/play_next/`, {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//             "X-CSRFToken": csrfToken
//         }
//     })
//     .then(res => res.json())
//     .then(data => {
//         if (data.player1 && data.player2) {
//             localStorage.setItem("player1", data.player1);
//             localStorage.setItem("player2", data.player2);
//             window.location.href = "/static/templates/game_tournament.html";
//         } else if (data.message) {
//             alert(data.message);
//         } else {
//             alert("Erreur: " + (data.error || "inconnue"));
//         }
//     })
//     .catch(error => {
//         console.error("Erreur lors du match :", error);
//         alert("Erreur lors du match");
//     });
// }
