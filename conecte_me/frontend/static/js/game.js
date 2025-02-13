document.addEventListener('DOMContentLoaded', () => {
    // =====================
    // 1. GESTION DE PLAY
    // =====================
    const playBtn = document.getElementById('play-btn');
    const gameOptionsContainer = document.getElementById('game-options-container');
  
    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      gameOptionsContainer.classList.toggle('open');
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
  });
  