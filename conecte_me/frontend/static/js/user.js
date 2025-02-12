document.addEventListener('DOMContentLoaded', () => {
  // ------------------------------
  // Fonctionnalité avatar (existante)
  // ------------------------------
  const cameraBtn = document.querySelector('.camera-icon');
  const avatarInput = document.getElementById('avatar-upload');
  const profileImage = document.getElementById('profile-image');

  cameraBtn.addEventListener('click', () => {
    avatarInput.click();
  });

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

  // Basculement du formulaire au clic sur l'item email
  emailToggle.addEventListener('click', (e) => {
    e.stopPropagation(); // Empêche la propagation pour ne pas déclencher le document click
    emailFormContainer.classList.toggle('open');
    emailChevron.classList.toggle('rotate');
  });

  // Fermeture du formulaire si clic en dehors
  document.addEventListener('click', (e) => {
    if (!emailFormContainer.contains(e.target) && !emailToggle.contains(e.target)) {
      emailFormContainer.classList.remove('open');
      emailChevron.classList.remove('rotate');
    }
  });

  // Validation des emails en temps réel
  function validateEmail(email) {
    // Expression régulière basique pour valider un email
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

  // Gestion de la soumission du formulaire de mise à jour d'email
  emailForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const currentEmail = document.getElementById('old-email').value.trim();
    const newEmail = document.getElementById('new-email').value.trim();
    const confirmEmail = document.getElementById('confirm-email').value.trim();
    const password = document.getElementById('email-password').value.trim();

    let isValid = true;

    // Vérification du nouvel email
    if (!validateEmail(newEmail)) {
      newEmailInput.classList.add('is-invalid');
      isValid = false;
    } else {
      newEmailInput.classList.remove('is-invalid');
    }

    // Vérification de la confirmation
    if (newEmail !== confirmEmail || confirmEmail === '') {
      confirmEmailInput.classList.add('is-invalid');
      isValid = false;
    } else {
      confirmEmailInput.classList.remove('is-invalid');
    }

    // Vérification du mot de passe
    const passwordInput = document.getElementById('email-password');
    if (password === '') {
      passwordInput.classList.add('is-invalid');
      isValid = false;
    } else {
      passwordInput.classList.remove('is-invalid');
    }

    if (!isValid) return;

    // Désactiver le bouton et afficher le spinner
    const submitButton = emailForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    const spinner = submitButton.querySelector('.spinner-border');
    spinner.classList.remove('d-none');

    // Préparation du payload
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
        // Ajout du token CSRF si vous utilisez la protection CSRF
        'X-CSRFToken': getCookie('csrftoken')
      },
      body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
      spinner.classList.add('d-none');
      submitButton.disabled = false;
      if (data.success) {
        alert("Email modifié avec succès !");
        // Mise à jour éventuelle de l'UI (par exemple, mise à jour de l'email affiché)
        emailForm.reset();
        emailFormContainer.classList.remove('open');
        emailChevron.classList.remove('rotate');
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

  // =========================================================
  // 3. Fonctionnalité Formulaire Changer le mot de passe
  // =========================================================
  const passwordToggle = document.getElementById('password-toggle');            // <div id="password-toggle">
  const passwordFormContainer = document.getElementById('password-form-container');  // <div id="password-form-container">
  const passwordChevron = document.getElementById('password-chevron');          // <i id="password-chevron">
  const passwordForm = document.getElementById('password-form');                // <form id="password-form">
  const oldPasswordInput = document.getElementById('old-password');             // <input id="old-password">
  const newPasswordInput = document.getElementById('new-password');             // <input id="new-password">
  const confirmPasswordInput = document.getElementById('confirm-password');     // <input id="confirm-password">

  // -- Ouverture/fermeture au clic sur "Changer le mot de passe"
  passwordToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    passwordFormContainer.classList.toggle('open');
    passwordChevron.classList.toggle('rotate');
  });

  // -- Fermeture si clic en dehors
  document.addEventListener('click', (e) => {
    if (!passwordFormContainer.contains(e.target) && !passwordToggle.contains(e.target)) {
      passwordFormContainer.classList.remove('open');
      passwordChevron.classList.remove('rotate');
    }
  });

  // -- Validation basique du mot de passe
  function validatePassword(pwd) {
    // Exemple : au moins 6 caractères
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

  // -- Soumission du formulaire "mot de passe" (mise à jour réelle via AJAX)
  passwordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const currentPassword = oldPasswordInput.value.trim();
    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    // Vérifier que tous les champs sont remplis
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Veuillez remplir tous les champs.");
      return;
    }
    // Vérifier la correspondance des nouveaux mots de passe
    if (newPassword !== confirmPassword) {
      alert("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }
    // Vérifier les critères de sécurité : minimum 8 caractères, au moins une majuscule, un chiffre et un caractère spécial
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      alert("Le nouveau mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial.");
      return;
    }
    // Vérifier que le nouveau mot de passe est différent de l'ancien
    if (currentPassword === newPassword) {
      alert("Votre nouveau mot de passe doit être différent de l'ancien.");
      return;
    }

    // Désactivation du bouton et affichage du spinner
    const submitButton = passwordForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    const spinner = submitButton.querySelector('.spinner-border');
    if (spinner) spinner.classList.remove('d-none');

    // Préparation du payload
    const payload = {
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: confirmPassword
    };

    // Envoi de la requête AJAX vers le backend pour mettre à jour le mot de passe
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
        // Réinitialisation du formulaire et fermeture du conteneur
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

  // =====================================================
  // 2. Gestion du Toggle 2FA avec les icônes Bootstrap
  // =====================================================
  // Récupération du bouton toggle et de l'icône
  const twofaBtn = document.getElementById('twofa-btn');
  const twofaIcon = document.getElementById('twofa-icon');
  // (Optionnel) conteneur du formulaire OTP
  const twofaFormContainer = document.getElementById('2faFormContainer');
  
  // Récupération de l'état sauvegardé dans le localStorage (par défaut désactivé)
  let twofaEnabled = localStorage.getItem('twofa_enabled') === 'true';
  
  // Fonction qui met à jour l'interface en fonction de l'état
  function updateTwofaUI() {
    if (twofaEnabled) {
      // Si 2FA est activée : on affiche l'icône toggle-on en vert
      twofaIcon.classList.remove('bi-toggle-off', 'text-danger');
      twofaIcon.classList.add('bi-toggle-on', 'text-success');
      twofaBtn.setAttribute('aria-label', 'Désactiver 2FA');
      // (Optionnel) Afficher le formulaire OTP
      if(twofaFormContainer) {
        twofaFormContainer.style.display = 'block';
      }
    } else {
      // Si 2FA est désactivée : on affiche l'icône toggle-off en rouge
      twofaIcon.classList.remove('bi-toggle-on', 'text-success');
      twofaIcon.classList.add('bi-toggle-off', 'text-danger');
      twofaBtn.setAttribute('aria-label', 'Activer 2FA');
      // (Optionnel) Masquer le formulaire OTP
      if(twofaFormContainer) {
        twofaFormContainer.style.display = 'none';
      }
    }
  }
  
  // Mettre à jour l'interface dès le chargement de la page
  updateTwofaUI();
  
  // Gestion du clic sur le bouton toggle
  twofaBtn.addEventListener('click', function() {
    twofaEnabled = !twofaEnabled;
    localStorage.setItem('twofa_enabled', twofaEnabled);
    updateTwofaUI();
  });  

  // Fonction utilitaire pour récupérer le cookie CSRF (si nécessaire)
  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        // Vérifie si ce cookie correspond au nom recherché
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  // Validation basique d'email
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
});
