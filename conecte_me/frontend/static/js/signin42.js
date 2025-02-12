document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('signin42-form');
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirmPassword');
    const submitButton = form.querySelector('button[type="submit"]');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const toggleConfirmBtn = document.getElementById('toggleConfirmPassword');
  
    // Validation en temps réel
    function validateForm() {
      const password = passwordInput.value;
      const confirm = confirmInput.value;
      // Critère : au moins 8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial
      const pattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
      let valid = pattern.test(password) && (password === confirm);
      submitButton.disabled = !valid;
      if (password !== confirm) {
        confirmInput.setCustomValidity("Les mots de passe ne correspondent pas.");
      } else {
        confirmInput.setCustomValidity("");
      }
    }
  
    passwordInput.addEventListener('input', validateForm);
    confirmInput.addEventListener('input', validateForm);
  
    // Afficher/masquer le mot de passe
    togglePasswordBtn.addEventListener('click', () => {
      const type = passwordInput.type === 'password' ? 'text' : 'password';
      passwordInput.type = type;
      togglePasswordBtn.querySelector('i').classList.toggle('bi-eye-slash');
    });
  
    toggleConfirmBtn.addEventListener('click', () => {
      const type = confirmInput.type === 'password' ? 'text' : 'password';
      confirmInput.type = type;
      toggleConfirmBtn.querySelector('i').classList.toggle('bi-eye-slash');
    });
  
    // Soumission du formulaire
    form.addEventListener('submit', (e) => {
      e.preventDefault();
  
      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }
  
      const formData = new FormData(form);
  
      fetch('https://localhost:8443/auth/42/password/', {
        method: 'POST',
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            // Redirige vers l'authentification OAuth 42
            window.location.href = 'https://localhost:8443/auth/42/login-42/';
          } else {
            alert("Erreur : " + data.error);
          }
        })
        .catch((err) => {
          console.error("Erreur réseau :", err);
          alert("Une erreur réseau s'est produite.");
        });
    });
  });
  