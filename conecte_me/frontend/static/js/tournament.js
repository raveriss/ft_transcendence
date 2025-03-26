// // Fonction pour récupérer le token CSRF
// function getCSRFToken() {
// 	let csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
// 	return csrfToken;
//   }
  
//   const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

//   // Fonction pour générer les champs pour les pseudos des joueurs
// function generatePlayerFields() {
//     const numPlayers = document.getElementById("num-players").value;
//     const playerInputsContainer = document.getElementById("player-inputs");

//     // Vider le conteneur avant de générer les nouveaux champs
//     playerInputsContainer.innerHTML = "";

//     // Créer un champ de texte pour chaque joueur
//     for (let i = 1; i <= numPlayers; i++) {
//         const playerInputDiv = document.createElement("div");
//         playerInputDiv.classList.add("mb-3");

//         const label = document.createElement("label");
//         label.classList.add("form-label");
//         label.textContent = `Pseudo du joueur ${i}`;

//         const input = document.createElement("input");
//         input.type = "text";
//         input.classList.add("form-control");
//         input.id = `player-${i}`;
//         input.placeholder = `Pseudo du joueur ${i}`;

//         playerInputDiv.appendChild(label);
//         playerInputDiv.appendChild(input);
//         playerInputsContainer.appendChild(playerInputDiv);
//     }
// }

// // Fonction pour créer le tournoi (envoyer les données au backend)
// function createTournament() {
//     const name = document.getElementById("tournament-name").value;
//     const numPlayers = document.getElementById("num-players").value;
//     const playerNicknames = [];

//     // Récupérer les pseudos des joueurs
//     for (let i = 1; i <= numPlayers; i++) {
//         const nickname = document.getElementById(`player-${i}`).value;
//         if (nickname) {
//             playerNicknames.push(nickname);
//         } else {
//             alert(`Veuillez entrer un pseudo pour le joueur ${i}`);
//             return;
//         }
//     }

//     // Faire une requête POST pour créer le tournoi
//     fetch('/tournament/create/', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//             'X-CSRFToken': csrfToken
//         },
//         body: JSON.stringify({
//             name: name,
//             num_players: numPlayers,
//             player_nicknames: playerNicknames
//         })
//     })
//     .then(response => response.json())
//     .then(data => {
//         if (data.error) {
//             alert(`Erreur: ${data.error}`);
//         } else {
//             alert(data.message);
//             document.getElementById("tournamentNameDisplay").textContent = data.name;
//             // Afficher les joueurs et autres infos si nécessaire
//             updatePlayerList(data.players);
//             updateMatchList(data.matches);
//         }
//     })
//     .catch(error => {
//         console.error('Erreur lors de la création du tournoi:', error);
//         alert("Une erreur est survenue lors de la création du tournoi.");
//     });
// }

// // Fonction pour mettre à jour la liste des joueurs affichée
// function updatePlayerList(players) {
//     const playerListContainer = document.getElementById("playerList");
//     playerListContainer.innerHTML = ''; // Vider la liste avant de la remplir

//     players.forEach(player => {
//         const li = document.createElement("li");
//         li.textContent = player.nickname;
//         playerListContainer.appendChild(li);
//     });
// }

// // Fonction pour mettre à jour la liste des matchs affichée
// function updateMatchList(matches) {
//     const matchListContainer = document.getElementById("matchList");
//     matchListContainer.innerHTML = ''; // Vider la liste avant de la remplir

//     matches.forEach(match => {
//         const li = document.createElement("li");
//         li.textContent = `${match.player1} vs ${match.player2} (Tour: ${match.round})`;
//         matchListContainer.appendChild(li);
//     });
// }

// // Fonction pour jouer le prochain match (ajoutée pour plus de complétude)
// function playNextMatch() {
//     // Remplacer ceci par l'appel réel pour jouer le match suivant
//     console.log("Prochain match...");
//     // Exemple de changement de statut après chaque match
//     alert("Match terminé !");
// }

let currentTournamentId = null;

const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

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
    const numPlayers = document.getElementById("numPlayers").value;
    const playerNicknames = [];

    for (let i = 1; i <= numPlayers; i++) {
        const playerNickname = document.getElementById(`player${i}`).value;
        playerNicknames.push(playerNickname);
    }

    const tournamentData = {
        name: tournamentName,
        num_players: numPlayers,
        player_nicknames: playerNicknames
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

function playNextMatch() {
    if (!currentTournamentId) {
        alert("Aucun tournoi sélectionné.");
        return;
    }

    fetch(`/tournament/${currentTournamentId}/play_next/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken
        }
    })
    .then(res => res.json())
    .then(data => {
        if (data.message) {
            console.log(data.message);
            alert(data.message);

            if (data.gagnant) {
                document.getElementById("winnerDisplay").textContent = data.gagnant;
            }

            if (data.message.includes("Tournoi terminé")) {
                document.getElementById("playNextMatchButton").disabled = true;
            }
        } else {
            alert("Erreur: " + (data.error || "inconnue"));
        }
    })
    .catch(error => {
        console.error("Erreur lors du match :", error);
        alert("Erreur lors du match");
    });
}
