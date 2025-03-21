console.log("game.js loaded");

// Fonction pour récupérer les réglages du jeu via l'API
async function fetchGameSettings() {
  console.log("fetchGameSettings() called");
  // Récupération du token JWT stocké (par exemple, lors de la connexion)
  const token = localStorage.getItem('jwtToken');
  console.log("Token récupéré dans game.js:", token);
  try {
    const response = await fetch("/api/game_settings/", {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    }
    const data = await response.json();
    console.log("Données récupérées depuis game.js:", data);
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des réglages :", error);
    // Valeurs par défaut en cas d'erreur
    return {
      time: 5,
      score_limit: 5,
      lives: 5,
      ball_speed: 2
    };
  }
}

// Fonction principale pour initialiser le jeu avec les réglages récupérés
(async function initGame() {
  const settings = await fetchGameSettings();

  // Paramètres de configuration du jeu, récupérés depuis l'API
  const paddleWidth = 20;
  const paddleHeight = 100;
  const WINNING_SCORE = settings.score_limit;     // Par exemple, 5
  const WINNING_TIME = settings.time * 60;          // Conversion en secondes
  const ballSpeedX = settings.ball_speed;
  const ballSpeedY = settings.ball_speed;

  const player1Name = settings.username;
  // const player1Name = "Joueur 1"
  const player2Name = 'Joueur 2';

  console.log("Configuration du jeu:", { WINNING_SCORE, WINNING_TIME, ballSpeedX, ballSpeedY });

  // Image du terrain
  const mapChoice = settings.map_choice;
  let fondcanvas;
  if (mapChoice === "retro") {
    // Soit un fond noir
    fondcanvas = null; // On gère un background noir en canvas
  } else {
    fondcanvas = new Image();
    if (mapChoice === "basketball") {
      fondcanvas.src = '/static/img/field_basketball.png';
    } else if (mapChoice === "hockey") {
      fondcanvas.src = '/static/img/field_hockey.png';
    } else if (mapChoice === "nfl") {
      fondcanvas.src = '/static/img/field_NFL.png';
    }
  }

  // Global pour suivre l'état des touches
  let keysPressed = {};

  function startLocalGame() {
    console.log("Démarrage du jeu Pong");
    console.log("Le win score est ", WINNING_SCORE);
    console.log("Le temp de jeu est ", WINNING_TIME);
    console.log("La vitesse de balle est ", ballSpeedX);

    // Création du canvas unique
    const canvas = document.createElement('canvas');
    canvas.id = 'pongCanvas';
    canvas.width = 1200;
    canvas.height = 900;
    // Centrage du canvas dans la page
    canvas.style.position = 'absolute';
    canvas.style.top = '50%';
    canvas.style.left = '50%';
    canvas.style.transform = 'translate(-50%, -50%)';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    // Variables de contrôle du jeu
    let isPaused = false;
    let isGameOver = false;
    let confirmQuit = false; // Pour la confirmation de quitter (la touche Q, si on l'active plus tard)

    const paddleSpeed = 10;
    const ballRadius = 10;

    // Chronomètre
    const startTime = Date.now();
    let elapsedTime = 0;
    const dateStart = new Date(startTime).toISOString();

    // Initialisation des joueurs
    const player1 = {
      x: 1,
      y: canvas.height / 2 - paddleHeight / 2,
      width: paddleWidth,
      height: paddleHeight,
      score: 0
    };

    const player2 = {
      x: canvas.width - paddleWidth - 1,
      y: canvas.height / 2 - paddleHeight / 2,
      width: paddleWidth,
      height: paddleHeight,
      score: 0
    };

    // Initialisation de la balle
    const ball = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      radius: ballRadius,
      speedX: ballSpeedX * (Math.random() < 0.5 ? 1 : -1),
      speedY: ballSpeedY * (Math.random() < 0.5 ? 1 : -1)
    };

    // Réinitialise la balle au centre avec une direction aléatoire
    function resetBall() {
      ball.x = canvas.width / 2;
      ball.y = canvas.height / 2;
      ball.speedX = ballSpeedX * (Math.random() < 0.5 ? 1 : -1);
      ball.speedY = ballSpeedY * (Math.random() < 0.5 ? 1 : -1);
    }

    // Met à jour le déplacement de la balle et gère les collisions
    function updateBall() {
      ball.x += ball.speedX;
      ball.y += ball.speedY;

      // Rebonds sur le haut et le bas
      if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= canvas.height) {
        ball.speedY = -ball.speedY;
      }

      // Collision avec la raquette gauche
      if (
        ball.x - ball.radius <= player1.x + player1.width &&
        ball.y >= player1.y &&
        ball.y <= player1.y + player1.height
      ) {
        // Inverser la direction et appliquer un facteur d'accélération (par exemple 1.05)
        ball.speedX = -ball.speedX * 1.05;
        ball.speedY = ball.speedY * 1.05;
        }

      // Collision avec la raquette droite
      if (
        ball.x + ball.radius >= player2.x &&
        ball.y >= player2.y &&
        ball.y <= player2.y + player2.height
      ) {
        ball.speedX = -ball.speedX * 1.05;
        ball.speedY = ball.speedY * 1.05;
      }
    }

    // Met à jour le chronomètre du match
    function updateTimer() {
      elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    }

    // Vérifie les scores et termine le match si un joueur atteint le score gagnant
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

    // Dessine le terrain, les raquettes, la balle, le score et le chronomètre
    function draw() {
      if (isGameOver) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Dessiner l'image de fond si chargée, sinon un fond noir
      if (fondcanvas && fondcanvas.complete && fondcanvas.naturalWidth !== 0) {
        ctx.drawImage(fondcanvas, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      // Tracer la ligne pointillée (commençant à 60px du haut)
      const startY = 60;
      ctx.beginPath();
      ctx.setLineDash([15, 10]);
      ctx.moveTo(canvas.width / 2, startY);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.strokeStyle = "white";
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.closePath();
      ctx.setLineDash([]);

      // Dessiner les raquettes
      ctx.fillStyle = "white";
      ctx.fillRect(player1.x, player1.y, player1.width, player1.height);
      ctx.fillRect(player2.x, player2.y, player2.width, player2.height);
      
      // Dessiner la balle
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = "white";
      ctx.fill();
      ctx.closePath();
      
      // Affichage des scores
      ctx.font = "40px Arial";
      ctx.textAlign = "center";
      ctx.fillText(`${player1Name}: ${player1.score}`, canvas.width / 4, 40);
      ctx.fillText(`${player2Name}: ${player2.score}`, (canvas.width * 3) / 4, 40);
      
      // Affichage du chronomètre
      const minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
      const seconds = (elapsedTime % 60).toString().padStart(2, '0');
      ctx.fillText(`${minutes}:${seconds}`, canvas.width / 2, 40);
      
      // Message de confirmation pour quitter (si jamais activé)
      if (confirmQuit) {
        ctx.fillStyle = "red";
        ctx.font = "50px Arial";
        ctx.fillText("Appuyez sur Q à nouveau pour quitter.", canvas.width / 2, canvas.height / 2);
      }
      // Message de pause
      else if (isPaused) {
        ctx.fillStyle = "red";
        ctx.font = "50px Arial";
        ctx.fillText("Jeu en pause, appuyez sur P pour reprendre.", canvas.width / 2, canvas.height / 2);
      }
    }

    // Quitte le jeu en affichant le vainqueur et revient sur /board via le routeur SPA
    function quitGame(winner, loser, winnerScore, loserScore) {
      console.log(`Victoire de ${winner} contre ${loser}`);
      isGameOver = true;
      confirmQuit = false;
      const duration = Math.floor((Date.now() - startTime) / 1000);
      const matchData = {
        player1: player1Name,
        player2: player2Name,
        score1: player1.score,
        score2: player2.score,
        duration: duration,
        date: dateStart,
        recorded: true
      };
      //
      // Route pour enregistrer le match (donne de match data)
      //
      console.log(`Durée du match : ${duration} sec`);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "white";
      ctx.font = "70px Arial";
      ctx.textAlign = "center";
      ctx.fillText(`Victoire de ${winner}!`, canvas.width / 2, canvas.height / 2 - 50);
      ctx.font = "50px Arial";
      ctx.fillText("Appuyez sur Entrée pour revenir au board.", canvas.width / 2, canvas.height / 2 + 50);
      document.addEventListener("keydown", function handleReturn(e) {
        if (e.key === "Enter") {
          navigateTo("/board");
          if (canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
          }
          document.removeEventListener("keydown", handleReturn);
        }
      });
    }

    // Gestion des commandes clavier avec un objet keysPressed pour mouvement continu
    document.addEventListener("keydown", function(event) {
      keysPressed[event.key] = true;
      if (isGameOver) return;
      if (event.key === "p" || event.key === "P") {
        isPaused = !isPaused;
        confirmQuit = false;
      }
    });
    document.addEventListener("keyup", function(event) {
      keysPressed[event.key] = false;
    });

    // Boucle principale du jeu
    function gameLoop() {
      if (isGameOver) return;
      if (!isPaused) {
        // Déplacement continu selon l'état des touches
        if (keysPressed["ArrowUp"]) {
          player2.y = Math.max(0, player2.y - paddleSpeed);
        }
        if (keysPressed["ArrowDown"]) {
          player2.y = Math.min(canvas.height - player2.height, player2.y + paddleSpeed);
        }
        if (keysPressed["w"] || keysPressed["W"]) {
          player1.y = Math.max(0, player1.y - paddleSpeed);
        }
        if (keysPressed["s"] || keysPressed["S"]) {
          player1.y = Math.min(canvas.height - player1.height, player1.y + paddleSpeed);
        }
        updateBall();
        checkScore();
        updateTimer();
        if (elapsedTime == WINNING_TIME) {
          if (player1.score !== player2.score) {
            if (player1.score > player2.score) {
              quitGame(player1Name, player2Name, player1.score, player2.score);
            } else {
              quitGame(player2Name, player1Name, player2.score, player1.score);
            }
            return;
          } else {
            // En cas d'égalité, le prochain point décisif remporte la partie
            WINNING_SCORE = player1.score + 1;
          }
        }
      }
      draw();
      requestAnimationFrame(gameLoop);
    }
    gameLoop();
    // Gestion du retour arrière du navigateur (popstate) : lorsqu'on quitte "/game"
    function handlePopState() {
      if (location.pathname !== "/game") {
        // Enregistrer le match avant de quitter
        const duration = Math.floor((Date.now() - startTime) / 1000);
        const matchData = {
          player1: player1Name,
          player2: player2Name,
          score1: player1.score,
          score2: player2.score,
          duration: duration,
          date: dateStart,
          recorded: true
        };
        //
        //rajouter fonction pour sauvegarder le match
        console.log("Match enregistré via popstate:", matchData);
        //
        //
        // Arrêter le jeu et retirer le canvas
        isGameOver = true;
        if (canvas.parentNode) {
          canvas.parentNode.removeChild(canvas);
        }
        window.removeEventListener("popstate", handlePopState);
      }
    }
    window.addEventListener("popstate", handlePopState);
  }

  // Lancement du jeu dès que le DOM est prêt
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startLocalGame);
  } else {
    startLocalGame();
  }
})();
