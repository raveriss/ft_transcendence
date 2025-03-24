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

function createTournament() {
    let name = document.getElementById("tournamentName").value;
    let numPlayers = document.getElementById("numPlayers").value;
    let playerInputs = document.querySelectorAll(".player-input");
    let playerNicknames = Array.from(playerInputs).map(input => input.value);

    fetch("/tournament/create/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ name, num_players: numPlayers, "player_nicknames[]": playerNicknames })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            alert("Tournoi créé !");
            loadTournamentDetails(data.tournament_id);
        }
    });
}

function loadTournamentDetails(tournamentId) {
    fetch(`${tournamentId}/`)
    .then(response => response.json())
    .then(data => {
        document.getElementById("tournamentNameDisplay").innerText = data.name;
        document.getElementById("winnerDisplay").innerText = data.winner || "Non défini";

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

        document.getElementById("playNextMatchButton").onclick = function () {
            playNextMatch(tournamentId);
        };
    });
}

function playNextMatch(tournamentId) {
    fetch(`${tournamentId}/play_next/`, { method: "POST" })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        loadTournamentDetails(tournamentId);
    });
}
