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
      fetch('/auth/user/update_login_status/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_connected: false })
      })
      .then(response => response.json())
      .then(data => {
        console.log("Statut mis à jour :", data);
        // Redirection vers home.html après la mise à jour
        window.location.href = 'home.html';
      })
      .catch(error => {
        console.error("Erreur lors de la mise à jour du statut :", error);
        window.location.href = 'home.html';
      });
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
      // Redirection vers stats_page.html
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
      // Redirection vers login.html
      window.location.href = '/login.html';
    });
  }

  // ====== GESTION DU BOUTON SIGNUP ======
  if (signupBtn) {
    signupBtn.addEventListener('click', () => {
      // Ajoute la classe d’état "active"
      signupBtn.classList.add('btn-primary');
      loginBtn?.classList.remove('btn-primary');
      // Redirection vers signup.html
      window.location.href = 'signup.html';
    });
  }

  // ====== GESTION DU BOUTON "CONNECT-42" ======
  if (connect42Btn) {
    connect42Btn.addEventListener('click', () => {
      // Redirection vers la page de saisie du mot de passe pour 42
      window.location.href = 'signin42.html';
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

  // ====== GESTION DE LA CASE À COCHER POUR LES POLITIQUES (TOS & Privacy) ======
  const tosCheckbox = document.getElementById('tos-checkbox');
  if (tosCheckbox && connect42Btn) {
    // Désactiver le bouton dès le chargement de la page
    connect42Btn.disabled = true;
    connect42Btn.classList.add('disabled');

    tosCheckbox.addEventListener('change', () => {
      if (tosCheckbox.checked) {
        connect42Btn.disabled = false;
        connect42Btn.classList.remove('disabled');
      } else {
        connect42Btn.disabled = true;
        connect42Btn.classList.add('disabled');
      }
    });
  }

  // --- Nouveau code pour mettre à jour le username et la photo de profil dans user.html ---
  if (window.location.href.includes('user.html')) {
    const playerNameElement = document.querySelector('.player-name');
    const profileImageElement = document.getElementById('profile-image');
    if (playerNameElement && profileImageElement) {
      fetch('/auth/user/', { credentials: 'include' })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          if (data.username) {
            playerNameElement.textContent = data.username;
          } else {
            playerNameElement.textContent = 'Error loading username';
          }
          if (data.profile_image) {
            profileImageElement.src = data.profile_image;
          }
        })
        .catch(error => {
          console.error('Error fetching user info:', error);
          playerNameElement.textContent = 'Error loading username';
          // Utiliser l'avatar par défaut en cas d'erreur
          profileImageElement.src = '/static/img/default-avatar.png';
        });
    }
  }

  
});
