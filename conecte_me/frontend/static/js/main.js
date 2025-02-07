// main.js

document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('login-btn');
  const signupBtn = document.getElementById('signup-btn');
  const connect42Btn = document.getElementById('connect-42');
  const userIcon = document.querySelector('.user-icon');
  const creditsBtn = document.getElementById('credits-btn');
  const setupBtn = document.getElementById('setup-btn');
  const statsBtn = document.getElementById('stats-btn');
  const exitBtn = document.getElementById('exit-btn');


  if (exitBtn) {
    exitBtn.addEventListener('click', () => {
      // Redirige vers index.html
      window.location.href = 'index.html';
    });
  }

  if (userIcon) {
    userIcon.addEventListener('click', () => {
      // Redirection vers user.html
      window.location.href = 'user.html';
    });
  }

  if (setupBtn) {
    setupBtn.addEventListener('click', () => {
      // Redirection vers la page game_setup.html
      window.location.href = 'game_setup.html';
    });
  }

  if (statsBtn) {
    statsBtn.addEventListener('click', () => {
      // Redirection vers game_setup.html
      window.location.href = 'stats_page.html';
    });
  }

  if (creditsBtn) {
    creditsBtn.addEventListener('click', () => {
      // Redirection vers team.html
      window.location.href = 'team.html';
    });
  }

  // ====== GESTION DU BOUTON LOGIN ======
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      // Ajoute la classe d’état "active"
      loginBtn.classList.add('btn-primary');
      signupBtn?.classList.remove('btn-primary');
      // Ici, vous pouvez rediriger, afficher un modal, etc.
      window.location.href = '/login.html';
    });
  }

  // ====== GESTION DU BOUTON SIGNUP ======
  if (signupBtn) {
    signupBtn.addEventListener('click', () => {
      // Ajoute la classe d’état "active"
      signupBtn.classList.add('btn-primary');
      loginBtn?.classList.remove('btn-primary');

      // EXEMPLE : rediriger vers une page signup.html
      // (À créer ou à remplacer par votre propre route)
      window.location.href = 'signup.html';
    });
  }

  // ====== GESTION DU BOUTON "CONNECT-42" ======
  if (connect42Btn) {
    connect42Btn.addEventListener('click', () => {
      // Redirection vers l'endpoint OAuth 42
      // Adaptez l'URL si nécessaire
      window.location.href = 'https://localhost:8443/auth/42/login-42/';
    });
  }

  // ====== GESTION DE LA RÉCUPÉRATION DU JWT (SI RETOUR OAUTH) ======
  const urlParams = new URLSearchParams(window.location.search);
  const jwt = urlParams.get('jwt');
  if (jwt) {
    const container = document.querySelector('.container');
    if (container) {
      localStorage.setItem('jwt', jwt);
    }
  }
});
