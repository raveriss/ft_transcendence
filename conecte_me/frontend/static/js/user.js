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

  // Gestion de la soumission du formulaire (simulation)
  emailForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailVal = newEmailInput.value.trim();
    const confirmVal = confirmEmailInput.value.trim();
    let isValid = true;

    if (!validateEmail(emailVal)) {
      newEmailInput.classList.add('is-invalid');
      isValid = false;
    } else {
      newEmailInput.classList.remove('is-invalid');
    }

    if (emailVal !== confirmVal || confirmVal === '') {
      confirmEmailInput.classList.add('is-invalid');
      isValid = false;
    } else {
      confirmEmailInput.classList.remove('is-invalid');
    }

    if (!isValid) {
      return;
    }

    const submitButton = emailForm.querySelector('button[type="submit"]');
    const spinner = submitButton.querySelector('.spinner-border');
    spinner.classList.remove('d-none');

    // Simulation d'un délai (exemple : 2 secondes)
    setTimeout(() => {
      spinner.classList.add('d-none');
      alert("Email modifié avec succès !");
      // Optionnel : fermer le formulaire et réinitialiser les champs
      emailFormContainer.classList.remove('open');
      emailChevron.classList.remove('rotate');
      newEmailInput.value = '';
      confirmEmailInput.value = '';
    }, 2000);
  });

  // =========================================================
  // 3. Fonctionnalité Formulaire Changer le mot de passe
  // =========================================================
  const passwordToggle = document.getElementById('password-toggle');            // <div id="password-toggle">
  const passwordFormContainer = document.getElementById('password-form-container');  // <div id="password-form-container">
  const passwordChevron = document.getElementById('password-chevron');          // <i id="password-chevron">
  const passwordForm = document.getElementById('password-form');                // <form id="password-form">
  const oldPasswordInput = document.getElementById('old-password');            // <input id="old-password">
  const newPasswordInput = document.getElementById('new-password');            // <input id="new-password">
  const confirmPasswordInput = document.getElementById('confirm-password');    // <input id="confirm-password">

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

  // -- Soumission du formulaire "mot de passe"
  passwordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const oldVal = oldPasswordInput.value.trim();
    const newVal = newPasswordInput.value.trim();
    const confirmVal = confirmPasswordInput.value.trim();
    let isValid = true;

    // Vérif mot de passe
    if (!validatePassword(newVal)) {
      newPasswordInput.classList.add('is-invalid');
      isValid = false;
    } else {
      newPasswordInput.classList.remove('is-invalid');
    }

    // Vérif confirmation
    if (newVal !== confirmVal || confirmVal === '') {
      confirmPasswordInput.classList.add('is-invalid');
      isValid = false;
    } else {
      confirmPasswordInput.classList.remove('is-invalid');
    }

    if (!isValid) {
      return;
    }

    // Affiche le spinner
    const submitButton = passwordForm.querySelector('button[type="submit"]');
    const spinner = submitButton.querySelector('.spinner-border');
    spinner.classList.remove('d-none');

    // Simulation d'une requête asynchrone (2 secondes)
    setTimeout(() => {
      spinner.classList.add('d-none');
      alert("Mot de passe modifié avec succès !");
      
      // Optionnel : refermer le formulaire et réinitialiser
      passwordFormContainer.classList.remove('open');
      passwordChevron.classList.remove('rotate');
      oldPasswordInput.value = '';
      newPasswordInput.value = '';
      confirmPasswordInput.value = '';
    }, 2000);
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

});
