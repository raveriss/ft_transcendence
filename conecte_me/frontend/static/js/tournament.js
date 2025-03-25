document.addEventListener("DOMContentLoaded", function () {
    loadTournaments();
});

function generatePlayerFields() {
    let numPlayers = document.getElementById("numPlayers").value;
    let container = document.getElementById("playersContainer");
    container.innerHTML = "";
    for (let i = 0; i < numPlayers; i++) {
        let input = document.createElement("input");
        input.type = "text";
        input.className = "form-control player-input";
        input.placeholder = "Pseudo du joueur " + (i + 1);
        container.appendChild(input);
    }
}

function getCSRFToken() {
    let csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
    return csrfToken ? csrfToken.value : '';
}

function createTournament() {
    let name = document.getElementById("tournamentName").value;
    let numPlayers = parseInt(document.getElementById("numPlayers").value,10);
    let playerInputs = document.querySelectorAll(".player-input");
    let playerNicknames = Array.from(playerInputs).map(input => input.value);

    const csrfToken = getCSRFToken();  // Récupère le token CSRF

    fetch("/tournament/create/", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken  // Inclut le token CSRF dans l'en-tête
        },
        body: JSON.stringify({
            name: name,
            num_players: numPlayers,
            player_nicknames: playerNicknames
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            alert("Tournoi créé !");
            console.log(data);
            if (data.tournament_id){
                loadTournamentDetails(data.tournament_id);
            } else {
                console.error("Tournament ID is missing in the response.");
            }
        }
    })
    .catch(error => console.error("Erreur:", error));
}

function loadTournamentDetails(tournamentId) {
    console.log("Tournament ID dans load playNextMatch:", tournamentId);  // Log pour vérifier l'ID avant l'appel
    if (!tournamentId) {
        console.error("Tournament ID is undefined dans loadTournamentDetails!");
        return;
    }
    console.log("on avance");
    fetch(`/tournament/${tournamentId}/`)
    .then(response => {
        console.log("Réponse brute : ", response);
        return response.json();
    })
    .then(response => response.json())
    .then(data => {
        console.log("Données reçues :", data);
        document.getElementById("tournamentNameDisplay").innerText = data.name;
        document.getElementById("winnerDisplay").innerText = data.winner || "Non défini";

        console.log("on avance :", tournamentId);
        let playerList = document.getElementById("playerList");
        playerList.innerHTML = "";
        data.players.forEach(player => {
            let li = document.createElement("li");
            li.textContent = player.nickname;
            playerList.appendChild(li);
        });

        let matchList = document.getElementById("matchList");
        matchList.innerHTML = "";
        data.matches.forEach(match => {
            let li = document.createElement("li");
            li.textContent = `${match.player1__nickname} vs ${match.player2__nickname}`;
            matchList.appendChild(li);
        });
        console.log("on avance un peu plus");

        console.log("Tournament ID avant playNextMatch:", tournamentId);  // Log pour vérifier l'ID avant l'appel
        document.getElementById("playNextMatchButton").onclick = function () {
            playNextMatch(tournamentId);
        };
    });
}

function playNextMatch(tournamentId) {
    // if (!tournamentId) {
    //     console.error("Tournament ID is undefined dans playNextMatch!");
    //     return;
    // }
    console.log("on est dans play");
    console.log("Tournament ID dans playNextMatch:", tournamentId);
    fetch(`/tournament/${tournamentId}/play_next/`, { method: "POST" })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        loadTournamentDetails(tournamentId);
    });
}
