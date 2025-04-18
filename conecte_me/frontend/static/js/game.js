async function fetchGameSettings() {
  console.log("fetchGameSettings() called");
  try {
    // Appel à l'API sans inclure manuellement le token,
    // le cookie sécurisé sera automatiquement envoyé.
    const response = await fetch("/api/game_settings/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "same-origin" // Permet d'inclure les cookies dans la requête
    });
    if (response.status === 401) {
      console.warn("Token expiré ou invalide, déconnexion...");
      localStorage.clear();
      sessionStorage.clear();
      return; // On arrête ici
    }
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
      ball_speed: 2,
      user_id: null,
      particles_enabled: true,
      paddle_hit_sound_enabled: true,
    };
  }
}

// Fonction principale pour initialiser le jeu avec les réglages récupérés
(async function initGame() {
  const settings = await fetchGameSettings();
  if (!settings) {
    // Le token a expiré ou la déconnexion a été déclenchée, on arrête l'initialisation.
    return;
  }
  let startTime = Date.now();
  let pausedDuration = 0;
  let pauseStart = null;
  const hitSound = new Audio("/static/sounds/hit.mp3");

  // Paramètres de configuration du jeu, récupérés depuis l'API
  const paddleWidth = 20;
  let paddleHeight;
  switch (settings.paddle_size) {
    case 'small':
      paddleHeight = 60;
      break;
    case 'large':
      paddleHeight = 140;
      break;
    case 'medium':
    default:
      paddleHeight = 100;
      break;
  }
  console.log("Paddle size:", settings.paddle_size);
  let WINNING_SCORE = settings.score_limit;     // Par exemple, 5
  const WINNING_TIME = settings.time * 60;          // Conversion en secondes
  const ballSpeedX = settings.ball_speed;
  const ballSpeedY = settings.ball_speed;

  const player1Name = settings.username;
  // Demander à l'utilisateur de saisir un alias pour le joueur 2
  let player2Name = prompt(t("player_name_prompt"), t("player2_default_name"));
  if (!player2Name || player2Name.trim() === "") {
    player2Name = t("player2_default_name");
  }
  // const player1Name = "Joueur 1"
  //const player2Name = 'Joueur 2';

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
    // const startTime = Date.now();
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

    const particlesEnabled = settings.particles_enabled === true;
    const particles = [];

    // 🟩 Effet particules collisions
    function spawnCollisionParticles(x, y) {
      for (let i = 0; i < 10; i++) {
        particles.push(createParticle(x, y));
      }
    }

    function createParticle(x, y) {
      return {
        x,
        y,
        alpha: 1,
        radius: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2
      };
    }
    
    function updateParticles() {
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.02;
        if (p.alpha <= 0) {
          particles.splice(i, 1);
        }
      }
    }

    function drawParticles(ctx) {
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.fill();
        ctx.closePath();
      }
    }

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

      if (particlesEnabled) {
        for (let i = 0; i < 3; i++) {
          particles.push(createParticle(ball.x, ball.y));
        }
      }
      
      // Rebonds sur le haut et le bas
      if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= canvas.height) {
        ball.speedY = -ball.speedY;
        if (particlesEnabled) spawnCollisionParticles(ball.x, ball.y);
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
        ball.x = player1.x + player1.width + ball.radius + 1;
        if (settings.paddle_hit_sound_enabled) hitSound.play();
        if (particlesEnabled) spawnCollisionParticles(ball.x, ball.y);
      }

      // Collision avec la raquette droite
      if (
        ball.x + ball.radius >= player2.x &&
        ball.y >= player2.y &&
        ball.y <= player2.y + player2.height
      ) {
        ball.speedX = -ball.speedX * 1.05;
        ball.speedY = ball.speedY * 1.05;
        ball.x = player2.x - ball.radius - 1;
        if (settings.paddle_hit_sound_enabled) hitSound.play();
        if (particlesEnabled) spawnCollisionParticles(ball.x, ball.y);
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

      updateParticles();
      drawParticles(ctx);
      
      // Dessiner la balle
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = "white";
      ctx.fill();
      ctx.closePath();
      
      // Affichage des scores
      ctx.font = "40px Arial";
      ctx.textAlign = "center";
      ctx.fillText(
        t("score_display").replace("{name}", player1Name).replace("{score}", player1.score),
        canvas.width / 4,
        40
      );
      ctx.fillText(
        t("score_display").replace("{name}", player2Name).replace("{score}", player2.score),
        (canvas.width * 3) / 4,
        40
      );
      
      
      // Affichage du chronomètre
      let displayElapsed;
		  if (isPaused && pauseStart !== null) {
		  	displayElapsed = Math.floor((pauseStart - startTime - pausedDuration) / 1000);
		  } else {
		  displayElapsed = Math.floor((Date.now() - startTime - pausedDuration) / 1000);
		  }

      const minutes = Math.floor(displayElapsed / 60).toString().padStart(2, '0');
      const seconds = (displayElapsed % 60).toString().padStart(2, '0');
      ctx.fillText(
        t("timer_display")
          .replace("{minutes}", minutes)
          .replace("{seconds}", seconds),
        canvas.width / 2,
        40
      );
            
      // Message de confirmation pour quitter (si jamais activé)
      if (confirmQuit) {
        ctx.fillStyle = "red";
        ctx.font = "50px Arial";
        ctx.fillText(t("quit_confirmation"), canvas.width / 2, canvas.height / 2);
      }
      // Message de pause
      else if (isPaused) {
        ctx.fillStyle = "red";
        ctx.font = "50px Arial";
        ctx.fillText(t("pause_message"), canvas.width / 2, canvas.height / 2);
      }
    }

    function saveMatchData(matchData) {
      // Envoi d'une requête POST à l'API qui enregistre l'historique des matchs
      fetch('/api/game_settings/match_history/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          // Plus besoin d'ajouter l'en-tête Authorization, le token est transmis via le cookie sécurisé
        },
        credentials: 'same-origin', // Permet d'envoyer les cookies avec la requête pour le domaine courant
        body: JSON.stringify(matchData)
      })
      .then(response => {
        if (response.status === 401) {
          localStorage.clear();
          sessionStorage.clear();
          throw new Error("HTTP 401 - Token expiré, déconnexion en cours");
        }
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} - ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("Match enregistré :", data);
      })
      .catch(error => {
        console.error("Erreur lors de l'enregistrement du match :", error);
      });
    }

    // Quitte le jeu en affichant le vainqueur et revient sur /board via le routeur SPA
    function quitGame(winner, loser, winnerScore, loserScore) {
      console.log(`Victoire de ${winner} contre ${loser}`);
      isGameOver = true;
      confirmQuit = false;
      const duration = Math.floor((Date.now() - startTime) / 1000);
      
      // Récupérer l'user_id du joueur 1 depuis le localStorage
      // const player1Id = localStorage.getItem('user_id');
      // console.log("player1Id =", player1Id);
      
      const matchData = {
        player1: player1Name,
        player2: player2Name,
        score1: player1.score,
        score2: player2.score,
        duration: duration,
        recorded: true
      };
      // Route pour enregistrer le match (donne de match data)
      saveMatchData(matchData);

      console.log(`Durée du match : ${duration} sec`);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "white";
      ctx.font = "70px Arial";
      ctx.textAlign = "center";
      ctx.fillText(
        t("win_message").replace("{winner}", winner),
        canvas.width / 2,
        canvas.height / 2 - 50
      );      
      ctx.font = "50px Arial";
      ctx.fillText(t("return_to_board"), canvas.width / 2, canvas.height / 2 + 50);
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
        if (isPaused){
          pauseStart = Date.now()
        }
        else {
          pausedDuration += Date.now() - pauseStart;
          pauseStart = null;
        }
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

window.stopGame = function stopGame() {
  const canvas = document.getElementById("pongCanvas");
  if (canvas) canvas.remove();
};
