document.addEventListener('DOMContentLoaded', () => {
  const playBtn = document.getElementById('play-btn');

  playBtn.addEventListener('click', () => {
    console.log("🔄 Redirection vers la page du jeu...");
    window.location.href = "pong_game.html";  // ✅ Redirige vers la page de jeu
  });
});
