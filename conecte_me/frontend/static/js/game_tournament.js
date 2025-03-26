// game_tournament.js
console.log("game_tournament.js loaded");

function getTournamentGameSettings() {
  const player1 = localStorage.getItem("player1");
    const player2 = localStorage.getItem("player2");
    const rawSettings = localStorage.getItem("gameSettings");

    let time = 5;
    let score_limit = 5;
    let ball_speed = 2;

    try {
        if (rawSettings) {
            const parsed = JSON.parse(rawSettings);
            time = parseInt(parsed.time);
            score_limit = parseInt(parsed.score_limit);
        }
    } catch (e) {
        console.warn("Échec de parsing des settings, utilisation des valeurs par défaut.");
    }

    return {
		time,
		score_limit,
		ball_speed,
		map_choice: "retro",
		username: player1,
		player1,
		player2
    };
}

(async function initGame() {
  const settings = getTournamentGameSettings();

  const paddleWidth = 20;
  const paddleHeight = 100;
  const WINNING_SCORE = settings.score_limit;
  const WINNING_TIME = settings.time * 60;
  const ballSpeedX = settings.ball_speed;
  const ballSpeedY = settings.ball_speed;

  const player1Name = settings.player1;
  const player2Name = settings.player2;
  const matchId = localStorage.getItem("currentMatchId");
  const tournamentId = localStorage.getItem("currentTournamentId");

  const mapChoice = settings.map_choice;
  let fondcanvas = null;
  if (mapChoice !== "retro") {
    fondcanvas = new Image();
    fondcanvas.src = `/static/img/field_${mapChoice}.png`;
  }

  let keysPressed = {};

  function startLocalGame() {
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

    let isPaused = false;
    let isGameOver = false;
    let confirmQuit = false;
    const paddleSpeed = 10;
    const ballRadius = 10;
    const startTime = Date.now();
    let elapsedTime = 0;

    const player1 = {
      x: 1,
      y: canvas.height / 2 - paddleHeight / 2,
      width: paddleWidth,
      height: paddleHeight,
      score: 0,
    };

    const player2 = {
      x: canvas.width - paddleWidth - 1,
      y: canvas.height / 2 - paddleHeight / 2,
      width: paddleWidth,
      height: paddleHeight,
      score: 0,
    };

    const ball = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      radius: ballRadius,
      speedX: ballSpeedX * (Math.random() < 0.5 ? 1 : -1),
      speedY: ballSpeedY * (Math.random() < 0.5 ? 1 : -1),
    };

    function resetBall() {
      ball.x = canvas.width / 2;
      ball.y = canvas.height / 2;
      ball.speedX = ballSpeedX * (Math.random() < 0.5 ? 1 : -1);
      ball.speedY = ballSpeedY * (Math.random() < 0.5 ? 1 : -1);
    }

    function updateBall() {
      ball.x += ball.speedX;
      ball.y += ball.speedY;

      if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= canvas.height) {
        ball.speedY = -ball.speedY;
      }

      if (
        ball.x - ball.radius <= player1.x + player1.width &&
        ball.y >= player1.y &&
        ball.y <= player1.y + player1.height
      ) {
        ball.speedX = -ball.speedX * 1.05;
        ball.speedY = ball.speedY * 1.05;
      }

      if (
        ball.x + ball.radius >= player2.x &&
        ball.y >= player2.y &&
        ball.y <= player2.y + player2.height
      ) {
        ball.speedX = -ball.speedX * 1.05;
        ball.speedY = ball.speedY * 1.05;
      }
    }

    function updateTimer() {
      elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    }

    function checkScore() {
      if (ball.x + ball.radius < 0) {
        player2.score++;
        resetBall();
      } else if (ball.x - ball.radius > canvas.width) {
        player1.score++;
        resetBall();
      }
      if (player1.score >= WINNING_SCORE) {
        quitGame(player1Name, player2Name, player1.score, player2.score);
      } else if (player2.score >= WINNING_SCORE) {
        quitGame(player2Name, player1Name, player2.score, player1.score);
      }
    }

    function draw() {
      if (isGameOver) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (fondcanvas && fondcanvas.complete && fondcanvas.naturalWidth !== 0) {
        ctx.drawImage(fondcanvas, 0, 0, canvas.width, canvas.height);
      }
      ctx.beginPath();
      ctx.setLineDash([15, 10]);
      ctx.moveTo(canvas.width / 2, 60);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.strokeStyle = "white";
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.closePath();
      ctx.setLineDash([]);
      ctx.fillStyle = "white";
      ctx.fillRect(player1.x, player1.y, player1.width, player1.height);
      ctx.fillRect(player2.x, player2.y, player2.width, player2.height);
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = "white";
      ctx.fill();
      ctx.closePath();
      ctx.font = "40px Arial";
      ctx.textAlign = "center";
      ctx.fillText(`${player1Name}: ${player1.score}`, canvas.width / 4, 40);
      ctx.fillText(`${player2Name}: ${player2.score}`, (canvas.width * 3) / 4, 40);
      const minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
      const seconds = (elapsedTime % 60).toString().padStart(2, '0');
      ctx.fillText(`${minutes}:${seconds}`, canvas.width / 2, 40);
    }

    function quitGame(winner, loser, winnerScore, loserScore) {
      isGameOver = true;
      const duration = Math.floor((Date.now() - startTime) / 1000);
      const data = {
        winner,
        score1: winner === player1Name ? winnerScore : loserScore,
        score2: winner === player1Name ? loserScore : winnerScore,
      };
      fetch(`/tournament/${tournamentId}/match/${matchId}/finish/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      }).then(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "70px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`Victoire de ${winner}!`, canvas.width / 2, canvas.height / 2 - 50);
        ctx.font = "50px Arial";
        ctx.fillText("Appuyez sur Entrée pour revenir au tournoi.", canvas.width / 2, canvas.height / 2 + 50);
        document.addEventListener("keydown", function handleReturn(e) {
          if (e.key === "Enter") {
            navigateTo("/static/templates/tournament_details.html");
            document.removeEventListener("keydown", handleReturn);
          }
        });
      });
    }

    document.addEventListener("keydown", function(event) {
      keysPressed[event.key] = true;
      if (event.key === "p" || event.key === "P") isPaused = !isPaused;
    });
    document.addEventListener("keyup", function(event) {
      keysPressed[event.key] = false;
    });

    function gameLoop() {
      if (isGameOver) return;
      if (!isPaused) {
        if (keysPressed["ArrowUp"]) player2.y = Math.max(0, player2.y - paddleSpeed);
        if (keysPressed["ArrowDown"]) player2.y = Math.min(canvas.height - player2.height, player2.y + paddleSpeed);
        if (keysPressed["w"] || keysPressed["W"]) player1.y = Math.max(0, player1.y - paddleSpeed);
        if (keysPressed["s"] || keysPressed["S"]) player1.y = Math.min(canvas.height - player1.height, player1.y + paddleSpeed);
        updateBall();
        checkScore();
        updateTimer();
        if (elapsedTime >= WINNING_TIME) {
          const winner = player1.score > player2.score ? player1Name : player2Name;
          const loser = player1.score > player2.score ? player2Name : player1Name;
          const score1 = player1.score;
          const score2 = player2.score;
          quitGame(winner, loser, score1, score2);
          return;
        }
      }
      draw();
      requestAnimationFrame(gameLoop);
    }

    gameLoop();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startLocalGame);
  } else {
    startLocalGame();
  }
})();