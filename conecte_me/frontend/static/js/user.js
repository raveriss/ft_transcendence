document.addEventListener("DOMContentLoaded", () => {
  changeLanguage(getCurrentLang()); // Appliquer immédiatement la langue actuelle
});

(function() {
  // ------------------------------
  // Fonction pour charger les statistiques utilisateur
  // ------------------------------
  function loadUserStats() {
    console.log("loadUserStats called");
    fetch('/api/game_settings/user_stats/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin' // Assure que les cookies sont envoyés avec la requête
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} - ${response.statusText}`);
      }
      return response.json();
    })
    .then(stats => {
      console.log("Stats utilisateur récupérées :", stats);
      // Mettre à jour les éléments de la page user.html
      // document.getElementById('elo').textContent = stats.elo;
      document.getElementById('total_games').textContent = stats.total_games;
      document.getElementById('wins').textContent = stats.wins;
      document.getElementById('losses').textContent = stats.losses;
    })
    .catch(error => {
      console.error("Erreur lors du chargement des stats utilisateur :", error);
    });
  }
  loadUserStats();
  // ------------------------------
  // Fonctionnalité avatar (existante)
  // ------------------------------
  const cameraBtn = document.querySelector('.camera-icon');
  const avatarInput = document.getElementById('avatar-upload');
  const profileImage = document.getElementById('profile-image');

  cameraBtn.addEventListener('click', () => {
    avatarInput.click();
  });

  function parseUserAgent(userAgent) {
    let platform = 'Unknown';
    let browser = 'Unknown';

    // Détection de la plateforme
    if (userAgent.indexOf('Linux') > -1) {
      platform = 'Linux';
    } else if (userAgent.indexOf('Windows') > -1) {
      platform = 'Windows';
    } else if (userAgent.indexOf('Macintosh') > -1) {
      platform = 'Mac';
    }

    // Détection du navigateur
    if (userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Edge') === -1) {
      browser = 'Chrome';
    } else if (userAgent.indexOf('Firefox') > -1) {
      browser = 'Firefox';
    } else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) {
      browser = 'Safari';
    } else if (userAgent.indexOf('Edge') > -1) {
      browser = 'Edge';
    }

    return { platform, browser };
  }


  avatarInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert("Format d'image non supporté. Seul JPEG et PNG sont autorisés.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("La taille de l'image ne doit pas dépasser 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
      profileImage.src = event.target.result;
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('avatar', file);

    fetch('/auth/user/upload_avatar/', {
      method: 'POST',
      credentials: 'include',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        if (data.profile_image_url) {
          profileImage.src = data.profile_image_url;
        }
        console.log("Avatar mis à jour avec succès.");
      } else {
        alert("Erreur lors de la mise à jour de l'avatar : " + data.error);
      }
    })
    .catch(error => {
      console.error("Erreur réseau :", error);
      alert("Erreur lors de l'envoi de l'image.");
    });
  });

  // ------------------------------
  // Fonctionnalité Formulaire Email
  // ------------------------------
  const emailToggle = document.getElementById('email-toggle');
  const emailFormContainer = document.getElementById('email-form-container');
  const emailChevron = document.getElementById('email-chevron');
  const emailForm = document.getElementById('email-form');
  const newEmailInput = document.getElementById('new-email');
  const confirmEmailInput = document.getElementById('confirm-email');

  emailToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    emailFormContainer.classList.toggle('open');
    emailChevron.classList.toggle('rotate');
    emailToggle.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!emailFormContainer.contains(e.target) && !emailToggle.contains(e.target)) {
      emailFormContainer.classList.remove('open');
      emailChevron.classList.remove('rotate');
      emailToggle.classList.remove('open');
    }
  });

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  newEmailInput.addEventListener('input', () => {
    const emailVal = newEmailInput.value.trim();
    if (!validateEmail(emailVal)) {
      newEmailInput.classList.add('is-invalid');
    } else {
      newEmailInput.classList.remove('is-invalid');
    }
  });

  confirmEmailInput.addEventListener('input', () => {
    const emailVal = newEmailInput.value.trim();
    const confirmVal = confirmEmailInput.value.trim();
    if (emailVal !== confirmVal) {
      confirmEmailInput.classList.add('is-invalid');
    } else {
      confirmEmailInput.classList.remove('is-invalid');
    }
  });

  emailForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const currentEmail = document.getElementById('old-email').value.trim();
    const newEmail = document.getElementById('new-email').value.trim();
    const confirmEmail = document.getElementById('confirm-email').value.trim();
    const password = document.getElementById('email-password').value.trim();

    let isValid = true;

    if (!validateEmail(newEmail)) {
      newEmailInput.classList.add('is-invalid');
      isValid = false;
    } else {
      newEmailInput.classList.remove('is-invalid');
    }

    if (newEmail !== confirmEmail || confirmEmail === '') {
      confirmEmailInput.classList.add('is-invalid');
      isValid = false;
    } else {
      confirmEmailInput.classList.remove('is-invalid');
    }

    const passwordInput = document.getElementById('email-password');
    if (password === '') {
      passwordInput.classList.add('is-invalid');
      isValid = false;
    } else {
      passwordInput.classList.remove('is-invalid');
    }

    if (!isValid) return;

    const submitButton = document.getElementById('email-submit');
    submitButton.disabled = true;
    const spinner = submitButton.querySelector('.spinner-border');
    if (spinner )spinner.classList.remove('d-none');

    const payload = {
      current_email: currentEmail,
      new_email: newEmail,
      password: password
    };

    fetch('/auth/user/update_email/', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
      },
      body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
      if (spinner) spinner.classList.add('d-none');
      submitButton.disabled = false;
      if (data.success) {
        alert("Email modifié avec succès !");
        emailForm.reset();
        emailFormContainer.classList.remove('open');
        emailChevron.classList.remove('rotate');
        emailToggle.classList.remove('open');
      } else {
        alert("Erreur : " + data.error);
      }
    })
    .catch(error => {
      console.error("Erreur lors de la requête :", error);
      spinner.classList.add('d-none');
      submitButton.disabled = false;
      alert("Une erreur est survenue lors de la mise à jour de l'email.");
    });
  });

  // ------------------------------
  // Fonctionnalité Formulaire Username
  // ------------------------------
  const usernameForm = document.getElementById('username-form');
  const newUsernameInput = document.getElementById('new-username');
  const usernamePasswordInput = document.getElementById('username-password');
  const usernameToggle = document.getElementById('username-toggle');
  const usernameFormContainer = document.getElementById('username-form-container');
  const usernameChevron = document.getElementById('username-chevron');

  usernameToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    usernameFormContainer.classList.toggle('open');
    usernameChevron.classList.toggle('rotate');
    usernameToggle.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!usernameFormContainer.contains(e.target) && !usernameToggle.contains(e.target)) {
      usernameFormContainer.classList.remove('open');
      usernameChevron.classList.remove('rotate');
      usernameToggle.classList.remove('open');
    }
  });

  usernameForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const newUsername = newUsernameInput.value.trim();
    const password = usernamePasswordInput.value.trim();

    if (!newUsername || !password) {
      alert("Tous les champs sont requis.");
      return;
    }

    const payload = {
      new_username: newUsername,
      password: password
    };

    fetch('/auth/user/update_username/', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
      },
      body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert("Nom d'utilisateur mis à jour !");
        document.querySelector('.player-name').textContent = newUsername;
        usernameForm.reset();
      } else {
        alert("Erreur : " + data.error);
      }
    })
    .catch(error => {
      console.error("Erreur réseau :", error);
      alert("Une erreur est survenue.");
    });
  });

  // ------------------------------
  // Fonctionnalité Formulaire Changer le mot de passe
  // ------------------------------
  const passwordToggle = document.getElementById('password-toggle');
  const passwordFormContainer = document.getElementById('password-form-container');
  const passwordChevron = document.getElementById('password-chevron');
  const passwordForm = document.getElementById('password-form');
  const oldPasswordInput = document.getElementById('old-password');
  const newPasswordInput = document.getElementById('new-password');
  const confirmPasswordInput = document.getElementById('confirm-password');

  passwordToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    passwordFormContainer.classList.toggle('open');
    passwordChevron.classList.toggle('rotate');
    passwordToggle.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!passwordFormContainer.contains(e.target) && !passwordToggle.contains(e.target)) {
      passwordFormContainer.classList.remove('open');
      passwordChevron.classList.remove('rotate');
      passwordToggle.classList.remove('open');
    }
  });

  function validatePassword(pwd) {
    return pwd.length >= 6;
  }

  newPasswordInput.addEventListener('input', () => {
    const val = newPasswordInput.value.trim();
    if (!validatePassword(val)) {
      newPasswordInput.classList.add('is-invalid');
    } else {
      newPasswordInput.classList.remove('is-invalid');
    }
  });

  confirmPasswordInput.addEventListener('input', () => {
    const newVal = newPasswordInput.value.trim();
    const confirmVal = confirmPasswordInput.value.trim();
    if (newVal !== confirmVal) {
      confirmPasswordInput.classList.add('is-invalid');
    } else {
      confirmPasswordInput.classList.remove('is-invalid');
    }
  });

  passwordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const currentPassword = oldPasswordInput.value.trim();
    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Veuillez remplir tous les champs.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      alert("Le nouveau mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial.");
      return;
    }
    if (currentPassword === newPassword) {
      alert("Votre nouveau mot de passe doit être différent de l'ancien.");
      return;
    }

    const submitButton = passwordForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    const spinner = submitButton.querySelector('.spinner-border');
    if (spinner) spinner.classList.remove('d-none');

    const payload = {
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: confirmPassword
    };

    fetch('/auth/user/update_password/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
      },
      credentials: 'include',
      body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
      if (spinner) spinner.classList.add('d-none');
      submitButton.disabled = false;
      if (data.success) {
        alert("Mot de passe modifié avec succès !");
        oldPasswordInput.value = '';
        newPasswordInput.value = '';
        confirmPasswordInput.value = '';
        passwordFormContainer.classList.remove('open');
        passwordChevron.classList.remove('rotate');
      } else {
        alert("Erreur : " + data.error);
      }
    })
    .catch(error => {
      console.error("Erreur :", error);
      if (spinner) spinner.classList.add('d-none');
      submitButton.disabled = false;
      alert("Une erreur est survenue lors de la mise à jour du mot de passe.");
    });
  });

  // ------------------------------
  // Gestion du Toggle 2FA
  // ------------------------------
  const twofaBtn = document.getElementById('twofa-btn');
  const twofaIcon = document.getElementById('twofa-icon');
  const twofaFormContainer = document.getElementById('2faFormContainer');
  let twofaEnabled = localStorage.getItem('twofa_enabled') === 'true';

  // Fonction pour mettre à jour l'icône selon l'état de 2FA
  function updateTwofaUI(is2faEnabled) {
    // Mettez à jour le localStorage pour conserver l'état
    localStorage.setItem('twofa_enabled', is2faEnabled);
    if (is2faEnabled) {
      twofaIcon.classList.remove('bi-toggle-off', 'text-danger');
      twofaIcon.classList.add('bi-toggle-on', 'text-success');
      twofaBtn.setAttribute('aria-label', 'Désactiver 2FA');
    } else {
      twofaIcon.classList.remove('bi-toggle-on', 'text-success');
      twofaIcon.classList.add('bi-toggle-off', 'text-danger');
      twofaBtn.setAttribute('aria-label', 'Activer 2FA');
    }
  }

  // Vérifier l'état initial de 2FA
  fetch('/auth/user/', { credentials: 'include' })
  .then(response => response.json())
    .then(data => {
      if (data.username) {
        document.querySelector('.player-name').textContent = data.username;
      }
      if (data.profile_image) {
        document.getElementById('profile-image').src = data.profile_image;
      }
      if (data.is_2fa_enabled !== undefined) {
        updateTwofaUI(data.is_2fa_enabled);
      }
    })
    .catch(error => console.error('Erreur de récupération des informations utilisateur:', error));

  // Gérer le clic sur le bouton de 2FA
  twofaBtn.addEventListener('click', () => {
    fetch('/auth/user/toggle_2fa/', {
      method: 'POST',
      credentials: 'include',
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          updateTwofaUI(data.is_2fa_enabled);
        } else {
          alert('Erreur lors de la mise à jour de l\'état 2FA');
        }
      })
      .catch(error => {
        console.error('Erreur lors de l\'appel API pour 2FA:', error);
        alert('Erreur lors de la mise à jour de 2FA');
      });
  });

  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // Si nous sommes sur user.html, récupérer l'historique des connexions
  if (window.location.pathname === '/user') {
    fetch('/auth/user/login_history/', { credentials: 'include' })
      .then(response => response.json())
      .then(data => {
        console.log('Données login_history:', data); // Pour vérifier dans la console
        const tbody = document.getElementById('login-history');
        tbody.innerHTML = ''; // Vider le contenu existant
        data.login_history.forEach(record => {  // Utilisation de 'record' pour désigner l'enregistrement
          const row = document.createElement('tr');

          // Date formatée
          const dateCell = document.createElement('td');
          dateCell.textContent = new Date(record.timestamp).toLocaleString();

          // Utiliser la fonction de parsing pour obtenir plateforme et navigateur
          const { platform, browser } = parseUserAgent(record.user_agent);

          const platformCell = document.createElement('td');
          platformCell.textContent = platform;

          const browserCell = document.createElement('td');
          browserCell.textContent = browser;

          // Adresse IP
          const ipCell = document.createElement('td');
          ipCell.textContent = record.ip_address;

          // Statut : afficher "Active" si is_connected est vrai
          // const statusCell = document.createElement('td');
          // console.log('login_history:', data.login_history);
          // if (record.is_connected) {
          //   statusCell.innerHTML = '<span class="status-badge status-active">Active</span>';
          // } else {
          //   statusCell.innerHTML = '<span class="status-badge status-inactive">Inactive</span>';
          // }

          row.append(dateCell, platformCell, browserCell, ipCell);
          tbody.appendChild(row);
        });
      })
      .catch(error => console.error('Erreur lors de la récupération de l\'historique:', error));
  }

  document.getElementById("export-data-btn").addEventListener("click", () => {
  fetch("/auth/user/export_data/", {
      method: "GET",
      credentials: "include"
  })
  .then(response => response.json())
  .then(data => {
      const jsonBlob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = window.URL.createObjectURL(jsonBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "mes_donnees.json";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
  })
  .catch(error => console.error("Erreur lors de l'export des données :", error));
  });

  document.getElementById("delete-account-btn").addEventListener("click", () => {
  if (confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
      fetch("/auth/user/delete_account/", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
            alert("Votre compte a été supprimé.");
            // Vider les données de stockage
            sessionStorage.removeItem('settings_id');
            sessionStorage.removeItem('customHistory');
            localStorage.removeItem('twofa_enabled');
            localStorage.removeItem('lang');
            localStorage.removeItem('username');
            // Rediriger vers '/home'
            navigateTo('/home');
        } else {
            alert("Erreur : " + data.error);
          }
      })
      .catch(error => console.error("Erreur lors de la suppression du compte :", error));
  }
  });
})();