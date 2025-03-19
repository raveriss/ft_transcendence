document.addEventListener('DOMContentLoaded', function() {
  // =====================================================
  // 1. Gestion du formulaire OTP pour la validation 2FA
  // =====================================================
  const form = document.getElementById('2faForm');
  const messageDiv = document.getElementById('message');

  if (form) { // S'assurer que le formulaire existe
    form.addEventListener('submit', function(event) {
      event.preventDefault();
      const otp_code = document.getElementById('otp_code').value.trim();

      const formData = new FormData();
      formData.append('otp_code', otp_code);

      fetch('/auth/2fa/validate/', {
        method: 'POST',
        body: formData,
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          messageDiv.style.color = 'green';
          messageDiv.textContent = data.message;
          setTimeout(() => {
            window.location.href = data.redirect;
          }, 1000);
        } else {
          messageDiv.style.color = 'red';
          messageDiv.textContent = data.error;
        }
      })
      .catch(error => {
        messageDiv.style.color = 'red';
        messageDiv.textContent = "Erreur lors de la validation du code.";
        console.error("Erreur:", error);
      });
    });
  } else {
    console.warn("Le formulaire 2faForm n'a pas été trouvé dans le DOM.");
  }

  // =====================================================
  // 2. Gestion du Toggle 2FA
  // =====================================================
  const twofaBtn = document.getElementById('twofa-btn');
  const twofaIcon = document.getElementById('twofa-icon');
  const twofaFormContainer = document.getElementById('2faFormContainer');

  // Récupérer l'état sauvegardé dans le localStorage (par défaut désactivé)
  let twofaEnabled = localStorage.getItem('twofa_enabled') === 'true';

  function updateTwofaUI() {
    if (!twofaIcon) {
      return;
    }
    if (twofaEnabled) {
      twofaIcon.classList.remove('bi-toggle-off', 'text-danger');
      twofaIcon.classList.add('bi-toggle-on', 'text-success');
      if (twofaBtn) {
        twofaBtn.setAttribute('aria-label', 'Désactiver 2FA');
      }
      if (twofaFormContainer) {
        twofaFormContainer.style.display = 'block';
      }
    } else {
      twofaIcon.classList.remove('bi-toggle-on', 'text-success');
      twofaIcon.classList.add('bi-toggle-off', 'text-danger');
      if (twofaBtn) {
        twofaBtn.setAttribute('aria-label', 'Activer 2FA');
      }
      if (twofaFormContainer) {
        twofaFormContainer.style.display = 'none';
      }
    }
  }

  updateTwofaUI();

  if (twofaBtn) {
    twofaBtn.addEventListener('click', function() {
      twofaEnabled = !twofaEnabled;
      localStorage.setItem('twofa_enabled', twofaEnabled);
      updateTwofaUI();
    });
  }
});