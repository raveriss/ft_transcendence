document.addEventListener('DOMContentLoaded', () => {
    const pongCanvas = document.getElementById("pongGame");

    if (!pongCanvas) return;  // Vérifie que le jeu s'exécute bien sur pong_game.html
  
    console.log("🎮 Jeu Pong lancé !");
    const ctx = pongCanvas.getContext('2d');

    // ✅ Récupérer les noms des joueurs depuis l'URL
    function getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            player: params.get('player') || "Joueur 1",
            opponent: params.get('opponent') || "Joueur 2"
        };
    }
    const { player, opponent } = getQueryParams();
    console.log(`🕹️ Joueur Gauche: ${player}, 🕹️ Joueur Droit: ${opponent}`);

    const paddleWidth = 10, paddleHeight = 100;
    let ballX, ballY, ballSpeedX, ballSpeedY;
    let leftPaddleY = (pongCanvas.height - paddleHeight) / 2;
    let rightPaddleY = (pongCanvas.height - paddleHeight) / 2;
    let leftPlayerScore = 0, rightPlayerScore = 0;
    let leftPaddleSpeed = 0, rightPaddleSpeed = 0;
    const ballRadius = 10;
    const paddleSpeed = 6;
    const maxScore = 5;  // Score limite pour gagner
    let gameRunning = true; // Variable pour stopper le jeu

    function resetBall() {
        ballX = pongCanvas.width / 2;
        ballY = pongCanvas.height / 2;
        ballSpeedX = 4 * (Math.random() < 0.5 ? 1 : -1);
        ballSpeedY = 4 * (Math.random() < 0.5 ? 1 : -1);
    }

    function drawBall() {
        ctx.beginPath();
        ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.closePath();
    }

    function drawPaddles() {
        ctx.fillStyle = "white";
        ctx.fillRect(0, leftPaddleY, paddleWidth, paddleHeight);
        ctx.fillRect(pongCanvas.width - paddleWidth, rightPaddleY, paddleWidth, paddleHeight);
    }

    function drawScore() {
        ctx.font = "20px Arial";
        ctx.fillStyle = "white";
        ctx.fillText(`${player}: ${leftPlayerScore} - ${opponent}: ${rightPlayerScore}`, pongCanvas.width / 4, 30);
    }

    function drawWinnerMessage(winner) {
        ctx.clearRect(0, 0, pongCanvas.width, pongCanvas.height);
        ctx.font = "30px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(`🎉 ${winner} a gagné !`, pongCanvas.width / 2, pongCanvas.height / 2);
    }

    function movePaddles() {
        leftPaddleY += leftPaddleSpeed;
        rightPaddleY += rightPaddleSpeed;

        if (leftPaddleY < 0) leftPaddleY = 0;
        if (leftPaddleY + paddleHeight > pongCanvas.height) leftPaddleY = pongCanvas.height - paddleHeight;
        if (rightPaddleY < 0) rightPaddleY = 0;
        if (rightPaddleY + paddleHeight > pongCanvas.height) rightPaddleY = pongCanvas.height - paddleHeight;
    }

    function collisionDetection() {
        if (ballY - ballRadius <= 0 || ballY + ballRadius >= pongCanvas.height) {
            ballSpeedY *= -1;
        }
    
        if (
            ballX - ballRadius <= paddleWidth &&
            ballY >= leftPaddleY &&
            ballY <= leftPaddleY + paddleHeight
        ) {
            ballSpeedX *= -1;
        }
    
        if (
            ballX + ballRadius >= pongCanvas.width - paddleWidth &&
            ballY >= rightPaddleY &&
            ballY <= rightPaddleY + paddleHeight
        ) {
            ballSpeedX *= -1;
        }
    
        // Vérifie si un point a été marqué
        if (ballX - ballRadius <= 0) {
            if (gameRunning) {
                rightPlayerScore++;
                gameRunning = false;  // Arrêter temporairement le jeu
                console.log(`⚠️ Point marqué par ${opponent}: ${rightPlayerScore}`);
                checkGameEnd();
            }
        }
    
        if (ballX + ballRadius >= pongCanvas.width) {
            if (gameRunning) {
                leftPlayerScore++;
                gameRunning = false;  // Arrêter temporairement le jeu
                console.log(`⚠️ Point marqué par ${player}: ${leftPlayerScore}`);
                checkGameEnd();
            }
        }
    }

    function checkGameEnd() {
        if (leftPlayerScore >= maxScore) {
            console.log(`🏆 Victoire de ${player} (${leftPlayerScore} - ${rightPlayerScore})`);
            gameRunning = false;
            drawWinnerMessage(player);
        } else if (rightPlayerScore >= maxScore) {
            console.log(`🏆 Victoire de ${opponent} (${leftPlayerScore} - ${rightPlayerScore})`);
            gameRunning = false;
            drawWinnerMessage(opponent);
        } else {
            console.log("⏳ Pause de 3 secondes avant de recommencer...");
            setTimeout(() => {
                resetBall();
                gameRunning = true;  // Redémarrer le jeu après la pause
                draw();
            }, 3000);
        }
    }

    function draw() {
        if (!gameRunning) return; // Stop le jeu si un joueur gagne

        ctx.clearRect(0, 0, pongCanvas.width, pongCanvas.height);
        drawBall();
        drawPaddles();
        drawScore();
        collisionDetection();
        movePaddles();

        ballX += ballSpeedX;
        ballY += ballSpeedY;
        requestAnimationFrame(draw);
    }

    function startPongGame() {
        console.log("🎮 Jeu Pong en cours...");
        resetBall();
        draw();
    }

    // ✅ Gestion des contrôles pour **deux joueurs en local**
    document.addEventListener('keydown', (e) => {
        if (e.key === 'w') leftPaddleSpeed = -paddleSpeed;  // Joueur 1 (Gauche) - Monte
        if (e.key === 's') leftPaddleSpeed = paddleSpeed;   // Joueur 1 (Gauche) - Descend
        if (e.key === 'ArrowUp') rightPaddleSpeed = -paddleSpeed; // Joueur 2 (Droite) - Monte
        if (e.key === 'ArrowDown') rightPaddleSpeed = paddleSpeed; // Joueur 2 (Droite) - Descend
    });

    document.addEventListener('keyup', (e) => {
        if (e.key === 'w' || e.key === 's') leftPaddleSpeed = 0;
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') rightPaddleSpeed = 0;
    });

    // Lancer le jeu quand la page du jeu se charge
    startPongGame();
});
