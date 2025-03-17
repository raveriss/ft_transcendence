(function() {
  const signupForm = document.getElementById('signup-form');

  // --- Gestion de l'aperçu de l'avatar ---
  const avatarInput = document.getElementById('avatar');
  const avatarImg = document.getElementById('avatar-img');
  const cameraIcon = document.getElementById('camera-icon');

  avatarInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        avatarImg.src = event.target.result;
        avatarImg.classList.remove('d-none');
        cameraIcon.classList.add('d-none');
      };
      reader.readAsDataURL(file);
    } else {
      avatarImg.src = '#';
      avatarImg.classList.add('d-none');
      cameraIcon.classList.remove('d-none');
    }
  });

  // --- Gestion de l'affichage/masquage du mot de passe ---
  const passwordInput = document.getElementById('password');
  const togglePasswordBtn = document.getElementById('togglePassword');
  togglePasswordBtn.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    const icon = togglePasswordBtn.querySelector('i');
    icon.classList.toggle('bi-eye');
    icon.classList.toggle('bi-eye-slash');
  });

  const confirmInput = document.getElementById('confirmPassword');
  const toggleConfirmBtn = document.getElementById('toggleConfirmPassword');
  toggleConfirmBtn.addEventListener('click', () => {
    const isPassword = confirmInput.type === 'password';
    confirmInput.type = isPassword ? 'text' : 'password';
    const icon = toggleConfirmBtn.querySelector('i');
    icon.classList.toggle('bi-eye');
    icon.classList.toggle('bi-eye-slash');
  });

  // --- Activation du bouton "S'inscrire" en fonction de la case RGPD ---
  const termsCheckbox = document.getElementById('terms-checkbox');
  const submitButton = document.querySelector('button[type="submit"]');
  // Assurez-vous que le bouton reste désactivé tant que la case n'est pas cochée
  submitButton.disabled = !termsCheckbox.checked;

  termsCheckbox.addEventListener('change', () => {
    submitButton.disabled = !termsCheckbox.checked;
  });

  // --- Soumission du formulaire ---
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Vérification de la correspondance des mots de passe
    if (passwordInput.value !== confirmInput.value) {
      confirmInput.setCustomValidity("Les mots de passe ne correspondent pas.");
    } else {
      confirmInput.setCustomValidity("");
    }

    // Validation côté client
    if (!signupForm.checkValidity()) {
      signupForm.classList.add('was-validated');
      return;
    }

    // Création de l'objet FormData (incluant l'image)
    const formData = new FormData(signupForm);

    // Envoi de la requête POST au backend
    fetch('/auth/signup/', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert(data.detail);
          navigateTo('/home');
        } else {
          alert(`Erreur : ${data.error}`);
        }
      })
      .catch(err => {
        console.error("Erreur réseau :", err);
        alert("Une erreur réseau s'est produite. Veuillez réessayer plus tard.");
      });
  });
})();
