console.log("✅ game_tournament.js loaded");

async function getTournamentIdFromSession() {
	const res = await fetch('/tournament/get_current_id/');
	const data = await res.json();
	return data.tournament_id;
}

async function fetchCurrentMatch(tournamentId) {
	const res = await fetch(`/tournament/${tournamentId}/play_next/`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' }
	});
	return await res.json();
}

(async function initGame() {
	const tournamentId = await getTournamentIdFromSession();
	const matchInfo = await fetchCurrentMatch(tournamentId);

	if (!matchInfo || !matchInfo.match_id || !matchInfo.player1 || !matchInfo.player2) {
		alert("Aucun match disponible.");
		return;
	}

	const matchId = matchInfo.match_id;
	const player1 = matchInfo.player1;
	const player2 = matchInfo.player2;
	const response = await fetch(`/tournament/api/details/${tournamentId}/`);
	const data = await response.json();
	const scoreLimit = data.tournament.score_limit;
	const timeLimit = data.tournament.time;

	// 🎮 Initialisation du canvas
	const canvas = document.createElement("canvas");
	canvas.id = "pongCanvas";
	canvas.width = 1200;
	canvas.height = 900;
	canvas.style.position = "absolute";
	canvas.style.top = "50%";
	canvas.style.left = "50%";
	canvas.style.transform = "translate(-50%, -50%)";
	document.body.appendChild(canvas);
	const ctx = canvas.getContext("2d");

	// 🏓 Logique du jeu
	const paddleWidth = 20;
	const paddleHeight = 100;
	const paddleSpeed = 10;
	const ballRadius = 10;
	let isPaused = false;
	let isGameOver = false;

	const player1State = { x: 1, y: canvas.height / 2 - paddleHeight / 2, width: paddleWidth, height: paddleHeight, score: 0 };
	const player2State = { x: canvas.width - paddleWidth - 1, y: canvas.height / 2 - paddleHeight / 2, width: paddleWidth, height: paddleHeight, score: 0 };
	const ball = {
		x: canvas.width / 2,
		y: canvas.height / 2,
		radius: ballRadius,
		speedX: 4 * (Math.random() < 0.5 ? 1 : -1),
		speedY: 4 * (Math.random() < 0.5 ? 1 : -1)
	};

	function resetBall() {
		ball.x = canvas.width / 2;
		ball.y = canvas.height / 2;
		ball.speedX = 4 * (Math.random() < 0.5 ? 1 : -1);
		ball.speedY = 4 * (Math.random() < 0.5 ? 1 : -1);
	}

	function updateBall() {
		ball.x += ball.speedX;
		ball.y += ball.speedY;

		if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= canvas.height) ball.speedY = -ball.speedY;

		if (
			ball.x - ball.radius <= player1State.x + player1State.width &&
			ball.y >= player1State.y &&
			ball.y <= player1State.y + player1State.height
		) {
			ball.speedX *= -1.05;
			ball.speedY *= 1.05;
		}

		if (
			ball.x + ball.radius >= player2State.x &&
			ball.y >= player2State.y &&
			ball.y <= player2State.y + player2State.height
		) {
			ball.speedX *= -1.05;
			ball.speedY *= 1.05;
		}
	}

	function checkScore() {
		if (ball.x + ball.radius < 0) {
			player2State.score++;
			resetBall();
		} else if (ball.x - ball.radius > canvas.width) {
			player1State.score++;
			resetBall();
		}

		if (player1State.score >= scoreLimit || player2State.score >= scoreLimit) {
			const winner = player1State.score > player2State.score ? player1 : player2;
			const loser = player1State.score > player2State.score ? player2 : player1;
			quitGame(winner, loser, player1State.score, player2State.score);
		}
	}

	let startTime = Date.now();

	function updateTimer() {
		const elapsed = Math.floor((Date.now() - startTime) / 1000);
		if (elapsed >= timeLimit * 60) {
			const winner = player1State.score > player2State.score ? player1 : player2;
			const loser = player1State.score > player2State.score ? player2 : player1;
			quitGame(winner, loser, player1State.score, player2State.score);
		}
	}

	function draw() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = "#0d1117";
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		ctx.setLineDash([10, 10]);
		ctx.beginPath();
		ctx.moveTo(canvas.width / 2, 0);
		ctx.lineTo(canvas.width / 2, canvas.height);
		ctx.strokeStyle = "white";
		ctx.lineWidth = 4;
		ctx.stroke();
		ctx.setLineDash([]);

		ctx.fillStyle = "white";
		ctx.fillRect(player1State.x, player1State.y, player1State.width, player1State.height);
		ctx.fillRect(player2State.x, player2State.y, player2State.width, player2State.height);

		ctx.beginPath();
		ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
		ctx.fill();

		ctx.font = "40px Orbitron, sans-serif";
		ctx.textAlign = "center";
		ctx.fillText(`${player1}: ${player1State.score}`, canvas.width / 4, 40);
		ctx.fillText(`${player2}: ${player2State.score}`, canvas.width * 3 / 4, 40);

		const elapsed = Math.floor((Date.now() - startTime) / 1000);
		const min = String(Math.floor(elapsed / 60)).padStart(2, '0');
		const sec = String(elapsed % 60).padStart(2, '0');
		ctx.fillText(`${min}:${sec}`, canvas.width / 2, 40);
	}

	function quitGame(winner, loser, winnerScore, loserScore) {
		isGameOver = true;

		const data = {
			winner,
			score1: winner === player1 ? winnerScore : loserScore,
			score2: winner === player1 ? loserScore : winnerScore
		};

		fetch(`/tournament/${tournamentId}/match/${matchId}/finish/`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data)
		}).then(() => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.fillStyle = "#0d1117";
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			ctx.fillStyle = "#3b82f6";
			ctx.font = "60px Orbitron, sans-serif";
			ctx.textAlign = "center";
			ctx.fillText(`Victoire de ${winner} !`, canvas.width / 2, canvas.height / 2 - 40);

			ctx.font = "30px Orbitron, sans-serif";
			ctx.fillStyle = "#f1f5f9";
			ctx.fillText("Appuie sur Entrée pour continuer", canvas.width / 2, canvas.height / 2 + 40);

			document.addEventListener("keydown", function handler(e) {
				if (e.key === "Enter") {
					window.location.replace(`/tournament-details`);
					document.removeEventListener("keydown", handler);
				}
			});
		});
	}

	const keys = {};
	document.addEventListener("keydown", e => keys[e.key] = true);
	document.addEventListener("keyup", e => keys[e.key] = false);

	function loop() {
		if (isGameOver) return;
		if (!isPaused) {
			if (keys["w"] || keys["W"]) player1State.y = Math.max(0, player1State.y - paddleSpeed);
			if (keys["s"] || keys["S"]) player1State.y = Math.min(canvas.height - player1State.height, player1State.y + paddleSpeed);
			if (keys["ArrowUp"]) player2State.y = Math.max(0, player2State.y - paddleSpeed);
			if (keys["ArrowDown"]) player2State.y = Math.min(canvas.height - player2State.height, player2State.y + paddleSpeed);

			updateBall();
			checkScore();
			updateTimer();
		}
		draw();
		requestAnimationFrame(loop);
	}

	loop();
})();
