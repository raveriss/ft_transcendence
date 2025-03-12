// // =====================
// // 1. GESTION DE PLAY
// // =====================
//   // Suppression (ou désactivation) de l'ancien event listener si nécessaire
//   const playBtn = document.getElementById('play-btn');
//   // Optionnel : si vous n'avez plus besoin de l'ancien comportement, retirez la gestion du click sur playBtn
//   // playBtn.removeEventListener('click', ...);

//   // Ajout des écouteurs sur chaque cercle
//   const iconCircles = document.querySelectorAll('#play-btn .icon-circle');
//   iconCircles.forEach(circle => {
//     circle.addEventListener('click', function(e) {
//       e.stopPropagation();
//       const mode = this.dataset.mode;
//       console.log('Mode choisi =', mode);
//       // Ici, ajoutez le code pour lancer le mode sélectionné,
//       // par exemple rediriger vers la page de jeu ou lancer une animation spécifique.
//     });
//   });




  
  
  
//   // =====================
//   // 2. GESTION DE SOCIAL
//   // =====================
// const gameOptionsContainer = document.getElementById('game-options-container');
// const socialBtn = document.getElementById('social-btn');
// const socialOptionsContainer = document.getElementById('social-options-container');

// socialBtn.addEventListener('click', (e) => {
//   e.stopPropagation();
//   socialOptionsContainer.classList.toggle('open');
// });

// document.addEventListener('click', (e) => {
//   if (!socialOptionsContainer.contains(e.target) && e.target !== socialBtn) {
//     socialOptionsContainer.classList.remove('open');
//   }
// });

// const socialOptionButtons = document.querySelectorAll('.social-option');
// socialOptionButtons.forEach(btn => {
//   btn.addEventListener('click', () => {
//     console.log('Option SOCIAL choisie =', btn.dataset.mode);
//     socialOptionsContainer.classList.remove('open');
//   });
// });  