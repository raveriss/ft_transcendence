document.addEventListener("DOMContentLoaded", () => {
  changeLanguage(getCurrentLang()); // Appliquer immédiatement la langue actuelle
});

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
  confirmInput.setCustomValidity(password !== confirm ? translationsCache[getCurrentLang()]["password_mismatch"] : "");
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

  fetch('/auth/42/password/', {
    method: 'POST',
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Redirige vers l'authentification OAuth 42
        window.location.href = window.location.protocol + '//' + window.location.hostname + ':8443/auth/42/login-42/';
      } else {
        const errorMessage = data.error ? data.error : translationsCache[getCurrentLang()]["unknown_error"];
        alert(`${translationsCache[getCurrentLang()]["error"]}: ${errorMessage}`);
      }
    })
    .catch((err) => {
      console.error(`${translationsCache[getCurrentLang()]["network_error"]}:`, err);
      alert(translationsCache[getCurrentLang()]["network_error"]);
    });
});  