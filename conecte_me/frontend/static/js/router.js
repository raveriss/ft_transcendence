// frontend/static/js/router.js
// Inspiré d’un mini-router SPA KISS.

const appDiv = document.querySelector('#app');

// Map “chemin -> Fichier HTML fragment”
// (Vous pouvez adapter : /login => login.html, /signup => signup.html, etc.)
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
    '/stats': 'static/templates/stats.html'
  };

// Définir la liste des routes nécessitant une authentification
const protectedRoutes = ['/board', '/user', '/stats', '/setup'];

function isRouteProtected(path) {
  return protectedRoutes.includes(path);
}

// Fonction qui interroge le backend pour vérifier l'authentification
async function checkAuth() {
  try {
    // On utilise la route '/auth/user/' qui renvoie les infos utilisateur si authentifié
    const res = await fetch('/auth/user/', { method: 'GET', credentials: 'include' });
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch (error) {
    console.error("Erreur lors de la vérification d'authentification :", error);
    return null;
  }
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
      } else {
        cssFile = 'static/css/main.css';
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
  
  

  function loadScriptForRoute(route) {
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
    // } else if (route === '/stats') {
    //   scriptFile = 'static/js/stats.js';
    } else {
      // Par défaut, chargez le script global
      scriptFile = 'static/js/main.js';
    }
    
    const script = document.createElement('script');
    script.id = 'route-script';
    script.src = scriptFile;
    script.async = false;
    document.body.appendChild(script);
  }

// Fonction principale pour charger une vue
async function navigateTo(path) {
  console.log("Navigating to:", path);

  // Si la route est protégée, vérifier l'authentification
  if (isRouteProtected(path)) {
    const user = await checkAuth();
    if (!user) {
      // Si l'utilisateur n'est pas authentifié, rediriger vers /home
      console.log("Utilisateur non authentifié, redirection vers /home");
      path = '/home';
    }
  }

  // Pour la configuration 2FA, redirige sans SPA
  if (path.startsWith("/auth/2fa/setup")) {
    window.location.href = path;
    return;
  }

  history.pushState({}, '', path);

  // Masque temporairement le contenu pour éviter le FOUC
  appDiv.style.visibility = 'hidden';

  try {
    // Attend que le nouveau CSS soit chargé
    await loadCSSForRoute(path);
  } catch (err) {
    console.error("Erreur lors du chargement du CSS :", err);
  }
  
  const file = routes[path] || routes['/'];
  console.log("Fetching file:", file);
  try {
    const res = await fetch(file, { method: 'GET' });
    if (!res.ok) {
      console.error("Erreur lors du fetch de", file, res.status);
      return;
    }
    const html = await res.text();
    console.log("Contenu récupéré (truncated):", html.substring(0, 100));
    appDiv.innerHTML = html;
    attachListeners();
    loadScriptForRoute(path);
  } catch (err) {
    console.error(err);
  } finally {
    // Révèle le contenu une fois que tout est chargé
    appDiv.style.visibility = 'visible';
  }
}


// Gère le “Back” / “Forward” du navigateur
window.addEventListener('popstate', () => {
  // On relit l’URL actuelle => recharge la vue
  navigateTo(window.location.pathname);
});

// Interception des clics sur liens <a data-link> pour naviguer en SPA
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
      // Si c'est le formulaire signin42, on le skippe
      if (form.id === 'signin42-form') {
        return;
      }

      // Exclure le formulaire signup pour éviter une double soumission
      if (form.id === 'signup-form') {
        return;
      }

      // Si c'est le formulaire de connexion et qu'il n'a pas d'attribut action, on le définit
      if (form.id === 'loginForm' && !form.getAttribute('action')) {
        form.setAttribute('action', '/auth/login/');
      }
      
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const url = form.action || window.location.pathname;
        const method = form.method || 'POST';
        const formData = new FormData(form);
        
        fetch(url, { method, body: formData, credentials: 'include' })
          .then(response => response.json())
          .then(data => {
            console.log("Réponse JSON du backend:", data);
            if (data.success && data.redirect) {
              navigateTo(data.redirect);
            }
          })
          .catch(console.error);
      });
    });


  // Exemple: si vous aviez des boutons type "window.location.href = 'signup.html';"
  // On les remplace par un simple: navigateTo('/signup');
  // Remplacement des redirections classiques par navigateTo
  const signupBtn = appDiv.querySelector('#signup-btn');
  if (signupBtn) {
    signupBtn.addEventListener('click', () => {
      navigateTo('/signup');
    });
  }

  const loginBtn = appDiv.querySelector('#login-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      navigateTo('/login');
    });
  }

  const connect42Btn = appDiv.querySelector('#connect-42');
  if (connect42Btn) {
    connect42Btn.addEventListener('click', (e) => {
      const tosCheckbox = document.getElementById('tos-checkbox');
      if (!tosCheckbox || !tosCheckbox.checked) {
        e.preventDefault();
        alert("Vous devez accepter les TOS avant de continuer !");
        return;
      }
      // Redirection directe vers l'endpoint OAuth 42
      window.location.href = '/auth/login-42/';
    });
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


  // Autres boutons remplacés par navigateTo
  const userIcon = appDiv.querySelector('.user-icon');
  if (userIcon) {
    userIcon.addEventListener('click', () => {
      navigateTo('/user');
    });
  }
  const setupBtn = appDiv.querySelector('#setup-btn');
  if (setupBtn) {
    setupBtn.addEventListener('click', () => {
      navigateTo('/setup');
    });
  }
  const statsBtn = appDiv.querySelector('#stats-btn');
  if (statsBtn) {
    statsBtn.addEventListener('click', () => {
      navigateTo('/stats');
    });
  }
  const creditsBtn = appDiv.querySelector('#credits-btn');
  if (creditsBtn) {
    creditsBtn.addEventListener('click', () => {
      navigateTo('/team');
    });
  }

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
        navigateTo('/home');
      })
      .catch(error => {
        console.error("Erreur lors de la mise à jour du statut :", error);
        navigateTo('/home');
      });
    });
  }
  
  // Etc. Répliquez la logique de vos anciens scripts qui faisaient du "window.location.href"
}

// Au premier chargement, on charge la vue correspondant à la route en cours
// (ex: si l’URL est https://localhost:8443/login, on charge login.html)
navigateTo(window.location.pathname);
