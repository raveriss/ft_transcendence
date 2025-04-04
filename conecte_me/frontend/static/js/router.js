// frontend/static/js/router.js
// Inspiré d’un mini-router SPA KISS.

// router.js
const appDiv = document.querySelector('#app');

const routes = {
  '/': 'static/templates/home.html',
    '/home': 'static/templates/home.html',
    '/login': 'static/templates/login.html',
    '/signup': 'static/templates/signup.html',
    '/terms': 'static/templates/terms.html',
    '/privacy': 'static/templates/privacy.html',
    '/board': 'static/templates/board.html',
    '/setup': 'static/templates/setup.html',
    '/user': 'static/templates/user.html',
    '/team': 'static/templates/team.html',
    '/stats': 'static/templates/stats.html',
    '/game': 'static/templates/game.html',
    '/tournament' : 'static/templates/tournament.html',
	'/tournament-details' : 'static/templates/tournament_details.html',
	'/game-tournament' : 'static/templates/game_tournament.html',
  '/social': 'static/templates/social.html',
};


const protectedRoutes = [
  '/board', '/user', '/stats', '/setup', '/social',
  '/tournament', '/tournament-details', '/game-tournament', '/game'
];

async function checkAuth() {
  try {
    const res = await fetch('/auth/user/', { credentials: 'include' });
    return res.ok ? res.json() : null;
  } catch {
    return null;
  }
}

function routeToFile(path, type = 'html') {
  const basePath = type === 'css' ? 'static/css' : 'static/js';
  const routeMap = {
    '/': '/home',
  };
  return `${basePath}${routeMap[path] || path}.${type}`;
}

async function loadCSS(path) {
  const oldLink = document.getElementById('route-css');
  const cssFile = routeToFile(path, 'css');
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = cssFile;
  link.id = 'route-css';
  if (oldLink) oldLink.remove();
  document.head.appendChild(link);
}

 function loadCSSForRoute(route) {
     return new Promise((resolve, reject) => {
       // Récupère l'ancien <link> s'il existe
       const oldLink = document.getElementById('route-css');
  
       // Détermine le fichier CSS selon la route
       let cssFile;
       if (route === '/login') {
         cssFile = 'static/css/login.css';
       } else if (route === '/signup') {
         cssFile = 'static/css/signup.css';
       } else if (route === '/signin42') {
         cssFile = 'static/css/signup.css';
       } else if (route === '/terms') {
         cssFile = 'static/css/terms.css';
       } else if (route === '/privacy') {
         cssFile = 'static/css/privacy.css';
       } else if (route === '/board') {
         cssFile = 'static/css/board.css';
       } else if (route === '/setup') {
         cssFile = 'static/css/setup.css';
       } else if (route === '/user') {
         cssFile = 'static/css/user.css';
       } else if (route === '/team') {
         cssFile = 'static/css/team.css';
       } else if (route === '/stats') {
         cssFile = 'static/css/stats.css';
       } else if (route === '/game') {
         cssFile = 'static/css/game.css';
       } else if (route === '/tournament-details') {
         cssFile = 'static/css/tournament_details.css';
       } else if (route === '/tournament') {
         cssFile = 'static/css/tournament.css';
       } else if (route === '/game-tournament') {
         cssFile = 'static/css/game_tournament.css';
       } else {
         cssFile = '/static/css/main.css';
       }
  
       // Crée un nouveau <link> avec un ID temporaire
       const newLink = document.createElement('link');
       newLink.rel = 'stylesheet';
       newLink.href = cssFile;
       newLink.id = 'new-route-css';
  
       // Une fois le CSS chargé, on retire l'ancien et on renomme l'ID
       newLink.onload = () => {
         if (oldLink) {
           oldLink.remove();
         }
         newLink.id = 'route-css';
         resolve();
       };
  
       newLink.onerror = () => {
         reject(new Error('Erreur de chargement du CSS : ' + cssFile));
       };
  
       // Ajoute le nouveau <link> dans le <head>
       document.head.appendChild(newLink);
     });
   }

     function loadScriptForRoute(route, callback) {

      // Pour la page /team, aucun script n'est nécessaire
    if (route === '/team') return;

    // Supprimez le script dynamique existant (s'il existe)
    const existingScript = document.getElementById('route-script');
    if (existingScript) {
      existingScript.remove();
    }
    
    let scriptFile;
    if (route === '/login') {
      scriptFile = 'static/js/login.js';
    } else if (route === '/signup') {
      scriptFile = 'static/js/signup.js';
    } else if (route === '/signin42') {
      scriptFile = 'static/js/signin42.js';
    } else if (route === '/board') {
      scriptFile = 'static/js/board.js';
    } else if (route === '/setup') {
      scriptFile = 'static/js/setup.js';
    } else if (route === '/user') {
      scriptFile = 'static/js/user.js';
    } else if (route === '/game') {
      scriptFile = 'static/js/game.js';
    } else if (route === '/tournament') {
        scriptFile = 'static/js/tournament.js';
	} else if (route === '/tournament-details') {
		scriptFile = 'static/js/tournament_details.js';
	} else if (route === '/tournament/list') {
		scriptFile = 'static/js/tournament.js';
	}else if (route === '/game-tournament') {
		scriptFile = 'static/js/game_tournament.js';
    } else if (route === '/stats') {
      scriptFile = 'static/js/stats.js';
    } else if (route === '/social') {
      scriptFile = 'static/js/social.js';
    } else {
      // Par défaut, chargez le script global
      scriptFile = 'static/js/main.js';
    }
    
    const script = document.createElement('script');
    script.id = 'route-script';
    script.src = scriptFile;
	  script.defer = true; // Préfère defer à async=false
    // script.async = false;
	  script.onload = () => {
    // Lance explicitement l'initialisation selon la route
    if (route === '/tournament' && typeof initTournamentPage === 'function') {
      initTournamentPage();
    }
    if (route === '/tournament-details' && typeof renderTournamentDetails === 'function') {
      renderTournamentDetails();
    }
    if (route === '/game-tournament' && typeof initGameTournament === 'function') {
      initGameTournament();
    }
    if (route === '/social') {
      if (typeof initSocialPage === 'function') {
        initSocialPage();
    } else {
    console.warn("⚠️ renderTournamentDetails non défini après chargement du JS");
    }
}

    if (typeof callback === 'function') callback();
  };

  document.body.appendChild(script);
  }

async function navigateTo(path, replace = false) {

  const settingsId = sessionStorage.getItem('settings_id');
  
  if (protectedRoutes.includes(path) && !(await checkAuth())) {
    path = '/login';
  }

  if (!routes[path]) path = '/home';
  if (settingsId){
    const isAuth = await checkAuth();
    if ((path === '/login' || path === '/signup') && isAuth) {
      path = '/board';
      replace = true;
    }
  }
  history[replace ? 'replaceState' : 'pushState']({}, '', path);
  
  if (path.startsWith("/auth/2fa")) {
    window.location.href = path;
    return;
  }

  appDiv.style.visibility = 'hidden';
  await loadCSSForRoute(path);

  const res = await fetch(routes[path]);
  if (res.ok) {
    appDiv.innerHTML = await res.text();
    attachListeners();
    loadScriptForRoute(path);
  }

  appDiv.style.visibility = 'visible';
}

navigateTo(location.pathname, true);

window.addEventListener('popstate', () => {
  navigateTo(location.pathname, true);
});

document.addEventListener('click', (e) => {
  const link = e.target.closest('a[data-link]');
  if (link) {
    e.preventDefault();
    navigateTo(link.getAttribute('href'));
  }
});

// Interception de formulaires pour éviter le rechargement total
function attachListeners() {
  const forms = appDiv.querySelectorAll('form');

  forms.forEach(form => {
    if (form.id === 'signin42-form' || form.id === 'signup-form') return;

    if (form.id === 'loginForm' && !form.getAttribute('action')) {
      form.setAttribute('action', '/auth/login/');
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const url = form.action || window.location.pathname;
      let method = form.method ? form.method.toUpperCase() : 'POST';
      if (method === 'GET') method = 'POST';

      const formData = new FormData(form);
      const jsonData = {};
      formData.forEach((value, key) => {
        jsonData[key] = value;
      });

      fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonData),
        credentials: 'include'
      })
        .then(response => response.json())
        .then(data => {
          console.log("Réponse JSON du backend:", data);
          if (data.redirect.startsWith("/auth/2fa")) {
            window.location.href = data.redirect;  // 🔥 redirection classique
          } else {
            navigateTo(data.redirect);
        }})
        .catch(console.error);
    });
  });

  const setupBtn = document.querySelector('#setup-btn');
  if (setupBtn) setupBtn.addEventListener('click', () => navigateTo('/setup'));

  const statsBtn = document.querySelector('#stats-btn');
  if (statsBtn) statsBtn.addEventListener('click', () => navigateTo('/stats'));

  const creditsBtn = document.querySelector('#credits-btn');
  if (creditsBtn) creditsBtn.addEventListener('click', () => navigateTo('/team'));

  const socialBtn = document.querySelector('#social-btn');
  if (socialBtn) socialBtn.addEventListener('click', () => navigateTo('/social'));

  const userIcon = document.querySelector('.user-icon');
  if (userIcon) userIcon.addEventListener('click', () => navigateTo('/user'));

  const loginBtn = document.querySelector('#login-btn');
  if (loginBtn) loginBtn.addEventListener('click', () => navigateTo('/login'));

  const signupBtn = document.querySelector('#signup-btn');
  if (signupBtn) signupBtn.addEventListener('click', () => navigateTo('/signup'));

  const connect42Btn = document.querySelector('#connect-42');
  if (connect42Btn) {
    const tosCheckbox = document.getElementById('tos-checkbox');
    connect42Btn.addEventListener('click', (e) => {
      if (!tosCheckbox || !tosCheckbox.checked) {
        e.preventDefault();
        alert("Vous devez accepter les TOS avant de continuer !");
        return;
      }
      window.location.href = '/auth/login-42/';
    });
  }

  const tosCheckbox = document.getElementById('tos-checkbox');
  if (tosCheckbox && connect42Btn) {
    connect42Btn.disabled = true;
    connect42Btn.classList.add('disabled');
    tosCheckbox.addEventListener('change', () => {
      connect42Btn.disabled = !tosCheckbox.checked;
      connect42Btn.classList.toggle('disabled', !tosCheckbox.checked);
    });
  }

  const exitBtn = document.getElementById('exit-btn');
  if (exitBtn) {
    exitBtn.addEventListener('click', () => {
      fetch('/auth/logout/', {
        method: 'POST',
        credentials: 'include',
      })
        .then(response => response.json())
        .then(data => {
          console.log("Déconnexion réussie :", data);
          localStorage.clear();
          sessionStorage.clear();
          navigateTo('/home');
        })
        .catch(error => {
          console.error("Erreur lors de la déconnexion :", error);
          // sessionStorage.removeItem('customHistory');
          navigateTo('/home');
        });
    });
  }

  const modeButtons = document.querySelectorAll('.icon-circle');
  modeButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      const mode = event.currentTarget.getAttribute('data-mode');
      if (mode === "2p-local") {
        navigateTo('/game');
      }
    });
  });
}

// async function logoutAndClearStorage() {
//   try {
//     const res = await fetch('/auth/logout/', {
//       method: 'POST',
//       credentials: 'include',
//     });
//     const data = await res.json();
//     console.log("Déconnexion réussie :", data);
//   } catch (error) {
//     console.error("Erreur lors de la déconnexion :", error);
//   } finally {
//     // Vider les données de stockage
//     localStorage.clear();
//     sessionStorage.clear();
//     // Rediriger vers '/home'
//     navigateTo('/home');
//   }
// }

// // Au premier chargement, on charge la vue correspondant à la route en cours
// // (ex: si l’URL est https://localhost:8443/login, on charge login.html)
// const initialPath = window.location.pathname + window.location.search;
// navigateTo(initialPath);

// let b = JSON.parse(sessionStorage.getItem('backward') || '[]');
// if (b.length === 0 && (initialPath === '/' || initialPath === '/home')) {
//   sessionStorage.setItem('backward', JSON.stringify(['/']));
// }

