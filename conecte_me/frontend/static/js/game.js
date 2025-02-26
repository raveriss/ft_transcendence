
  document.addEventListener('DOMContentLoaded', () => {
  // =====================
  // 1. GESTION DE PLAY
  // =====================
  const playBtn = document.getElementById('play-btn');
  const gameOptionsContainer = document.getElementById('game-options-container');

  playBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    gameOptionsContainer.classList.toggle('open');
    console.log('playBtn clicked');
    initGame();
  });

  document.addEventListener('click', (e) => {
    if (!gameOptionsContainer.contains(e.target) && e.target !== playBtn) {
      gameOptionsContainer.classList.remove('open');
    }
  });

  const gameOptionButtons = document.querySelectorAll('.game-option');
  gameOptionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      console.log('Mode choisi =', btn.dataset.mode);
      gameOptionsContainer.classList.remove('open');
      startGame(btn.dataset.mode);  // Start the game with the selected mode
    });
  });

  // =====================
  // 2. GESTION DE SOCIAL
  // =====================
  const socialBtn = document.getElementById('social-btn');
  const socialOptionsContainer = document.getElementById('social-options-container');

  socialBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    socialOptionsContainer.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!socialOptionsContainer.contains(e.target) && e.target !== socialBtn) {
      socialOptionsContainer.classList.remove('open');
    }
  });

  const socialOptionButtons = document.querySelectorAll('.social-option');
  socialOptionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      console.log('Option SOCIAL choisie =', btn.dataset.mode);
      socialOptionsContainer.classList.remove('open');
    });
  });

  // =======================
  // WebSocket Communication
  // =======================
  let socket;
  // const socket = new WebSocket('ws://localhost:8000/ws/game/');  // Connect to WebSocket server
  const gameContainer = document.getElementById("gameContainer");
  const pongCanvas = document.getElementById("pongGame");
  const ctx = pongCanvas.getContext('2d');

  // Game state variables
  let ballSpeedX = 4, ballSpeedY = 4;  
  let leftPaddleSpeed = 0, rightPaddleSpeed = 0;  
  let leftPaddleY = (pongCanvas.height - 100) / 2;  
  let rightPaddleY = (pongCanvas.height - 100) / 2;  
  let leftPlayerScore = 0, rightPlayerScore = 0;
  let ballX, ballY;

  const paddleHeight = 100;
  const paddleWidth = 10;
  const ballRadius = 10;
  const paddleSpeed = 5;

  // Handle WebSocket connection
  // socket.onopen = function() {
  //   console.log("WebSocket connection established.");
  // };

  // Handle messages from the backend
  // socket.onmessage = function(e) {
  //   const data = JSON.parse(e.data);

  //   if (data.event === 'game_started') {
  //     console.log(data.message);
  //     startPongGame();
  //   }

  //   if (data.event === 'paddle_moved') {
  //     updatePaddle(data.player, data.position);
  //   }

  //   if (data.event === 'score_updated') {
  //     updateScore(data.left_score, data.right_score);
  //   }
  // };

  // Game start function
  function startGame(mode) {
    console.log("Starting game in mode:", mode);
    startPongGame();
  }

  // Start Pong game
  function startPongGame() {
    console.log("Game started!");
    resetBall();
    draw();
  }

  // Draw the ball
  function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
  }

  // Draw the paddles
  function drawPaddles() {
    ctx.beginPath();
    ctx.rect(0, leftPaddleY, paddleWidth, paddleHeight);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.rect(pongCanvas.width - paddleWidth, rightPaddleY, paddleWidth, paddleHeight);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
  }

  // Draw the score
  function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Score: " + leftPlayerScore + " - " + rightPlayerScore, pongCanvas.width / 2 - 50, 20);
  }

  // Handle paddle movement
  function updatePaddle(player, position) {
    if (player === 'left') {
      leftPaddleY = position;
    } else if (player === 'right') {
      rightPaddleY = position;
    }
  }

  // Update the score from the backend
  function updateScore(leftScore, rightScore) {
    leftPlayerScore = leftScore;
    rightPlayerScore = rightScore;
  }

  // Ball-paddle and ball-wall collision logic
  function collisionDetection() {
    if (ballX - ballRadius <= paddleWidth && ballY >= leftPaddleY && ballY <= leftPaddleY + paddleHeight) {
      ballSpeedX = -ballSpeedX;
      socket.send(JSON.stringify({
        action: 'move_paddle',
        player: 'left',
        position: leftPaddleY
      }));
    }

    if (ballX + ballRadius >= pongCanvas.width - paddleWidth && ballY >= rightPaddleY && ballY <= rightPaddleY + paddleHeight) {
      ballSpeedX = -ballSpeedX;
      socket.send(JSON.stringify({
        action: 'move_paddle',
        player: 'right',
        position: rightPaddleY
      }));
    }

    if (ballX - ballRadius <= 0) {
      rightPlayerScore++;
      socket.send(JSON.stringify({
        action: 'update_score',
        left_score: leftPlayerScore,
        right_score: rightPlayerScore
      }));
      resetBall();
    }

    if (ballX + ballRadius >= pongCanvas.width) {
      leftPlayerScore++;
      socket.send(JSON.stringify({
        action: 'update_score',
        left_score: leftPlayerScore,
        right_score: rightPlayerScore
      }));
      resetBall();
    }
  }

  // Reset the ball after scoring
  function resetBall() {
    ballX = pongCanvas.width / 2;
    ballY = pongCanvas.height / 2;
    ballSpeedX = 4 * (Math.random() < 0.5 ? 1 : -1);
    ballSpeedY = 4 * (Math.random() < 0.5 ? 1 : -1);
  }

  // Move paddles within bounds
  function movePaddles() {
    leftPaddleY += leftPaddleSpeed;
    rightPaddleY += rightPaddleSpeed;

    if (leftPaddleY < 0) leftPaddleY = 0;
    if (rightPaddleY < 0) rightPaddleY = 0;
    if (leftPaddleY + paddleHeight > pongCanvas.height) leftPaddleY = pongCanvas.height - paddleHeight;
    if (rightPaddleY + paddleHeight > pongCanvas.height) rightPaddleY = pongCanvas.height - paddleHeight;
  }

  // Draw everything on the canvas
  function draw() {
    console.log("Drawing frame... Ball at X=${ballX}, Y=${ballY}");
    console.log(ctx);
    ctx.clearRect(0, 0, pongCanvas.width, pongCanvas.height);
    drawBall();
    drawPaddles();
    drawScore();
    collisionDetection();
    movePaddles();

    ballX += ballSpeedX;
    ballY += ballSpeedY;

    if (ballY + ballRadius > pongCanvas.height || ballY - ballRadius < 0) {
      ballSpeedY = -ballSpeedY;
    }

    requestAnimationFrame(draw);  // Request the next frame
  }

  // Handle paddle movement via keyboard
  document.addEventListener('keydown', (e) => {
    if (e.key === 'w') leftPaddleSpeed = -paddleSpeed;
    if (e.key === 's') leftPaddleSpeed = paddleSpeed;
    if (e.key === 'ArrowUp') rightPaddleSpeed = -paddleSpeed;
    if (e.key === 'ArrowDown') rightPaddleSpeed = paddleSpeed;
  });

  document.addEventListener('keyup', (e) => {
    if (e.key === 'w' || e.key === 's') leftPaddleSpeed = 0;
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') rightPaddleSpeed = 0;
  });

  // Initialize the game once the WebSocket connection is established

  function initGame() {
    console.log("🔄 Initialisation du WebSocket et du jeu...");
    
    // Vérifie si le WebSocket est déjà ouvert
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        socket = new WebSocket('ws://localhost:8000/ws/game/');
    
        socket.onopen = function() {
            console.log("✅ WebSocket connection established.");
        };

        socket.onmessage = function(e) {
            const data = JSON.parse(e.data);
    
            if (data.event === 'game_started') {
                console.log(data.message);
                startPongGame();
            }

            if (data.event === 'paddle_moved') {
                updatePaddle(data.player, data.position);
                draw();
            }

            if (data.event === 'score_updated') {
                updateScore(data.left_score, data.right_score);
                draw();
            }
        };

        socket.onclose = function() {
            console.warn("⚠️ WebSocket Disconnected. Reconnecting in 3 seconds...");
            setTimeout(initGame, 3000);
        };
    }

    startPongGame();  // Lance le jeu uniquement après avoir cliqué sur "Play"
}

});