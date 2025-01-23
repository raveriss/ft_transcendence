document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signup-form');

  // === Aperçu de l'avatar ===
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
          // Remettre à zéro
          avatarImg.src = '#';
          avatarImg.classList.add('d-none');
          cameraIcon.classList.remove('d-none');
      }
  });

  // === Affichage/masquage du mot de passe ===
  const passwordInput = document.getElementById('password');
  const togglePasswordBtn = document.getElementById('togglePassword');
  togglePasswordBtn.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      // Change l’icône
      const icon = togglePasswordBtn.querySelector('i');
      icon.classList.toggle('bi-eye');
      icon.classList.toggle('bi-eye-slash');
  });

  const confirmInput = document.getElementById('confirmPassword');
  const toggleConfirmBtn = document.getElementById('toggleConfirmPassword');
  toggleConfirmBtn.addEventListener('click', () => {
      const isPassword = confirmInput.type === 'password';
      confirmInput.type = isPassword ? 'text' : 'password';
      // Change l’icône
      const icon = toggleConfirmBtn.querySelector('i');
      icon.classList.toggle('bi-eye');
      icon.classList.toggle('bi-eye-slash');
  });

  // === Validation & soumission du formulaire ===
  signupForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Vérifier la correspondance des mots de passe
      if (passwordInput.value !== confirmInput.value) {
          confirmInput.setCustomValidity("Les mots de passe ne correspondent pas.");
      } else {
          confirmInput.setCustomValidity("");
      }

      // Forcer la validation côté client
      if (!signupForm.checkValidity()) {
          signupForm.classList.add('was-validated');
          return;
      }

      // Formulaire valide
      console.log("Formulaire d'inscription soumis !");

      // Création des données du formulaire
      const formData = new FormData(signupForm);

      // Envoi des données au backend
      fetch('https://localhost:8443/auth/signup/', { // Chemin vers votre endpoint backend
          method: 'POST',
          body: formData,
      })
      .then(response => response.json())
      .then(data => {
          if (data.success) {
              alert(data.detail); // Affiche un message de succès
              window.location.href = '/confirmation.html'; // Redirige vers la page de confirmation
          } else {
              alert(`Erreur : ${data.error}`); // Affiche un message d'erreur
          }
      })
      .catch(err => {
          console.error("Erreur réseau :", err);
          alert("Une erreur réseau s'est produite. Veuillez réessayer plus tard.");
      });
  });
});
