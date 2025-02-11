document.addEventListener('DOMContentLoaded', function() {
    // =====================================================
    // 1. Gestion du formulaire OTP pour la validation 2FA
    // =====================================================
    const form = document.getElementById('2faForm');
    const messageDiv = document.getElementById('message');
    
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
          // Redirection vers l'interface de jeu après un court délai
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
    
    // =====================================================
    // 2. Gestion du Toggle 2FA
    // =====================================================
    // On récupère le bouton toggle et l'icône
    const twofaBtn = document.getElementById('twofa-btn');
    const twofaIcon = document.getElementById('twofa-icon');
    // (Optionnel) conteneur du formulaire OTP, à afficher uniquement si la 2FA est activée
    const twofaFormContainer = document.getElementById('2faFormContainer');
    
    // Récupérer l'état sauvegardé dans le localStorage (par défaut désactivé)
    let twofaEnabled = localStorage.getItem('twofa_enabled') === 'true';
    
    function updateTwofaUI() {
      if (twofaEnabled) {
        // 2FA activée : affiche l'icône "toggle on" en vert
        twofaIcon.classList.remove('bi-toggle-off', 'text-danger');
        twofaIcon.classList.add('bi-toggle-on', 'text-success');
        twofaBtn.setAttribute('aria-label', 'Désactiver 2FA');
        // Afficher le formulaire OTP (si vous souhaitez le lier à l'état 2FA)
        if(twofaFormContainer) {
          twofaFormContainer.style.display = 'block';
        }
      } else {
        // 2FA désactivée : affiche l'icône "toggle off" en rouge
        twofaIcon.classList.remove('bi-toggle-on', 'text-success');
        twofaIcon.classList.add('bi-toggle-off', 'text-danger');
        twofaBtn.setAttribute('aria-label', 'Activer 2FA');
        // Masquer le formulaire OTP
        if(twofaFormContainer) {
          twofaFormContainer.style.display = 'none';
        }
      }
    }
    
    // Mettre à jour l'interface au chargement de la page
    updateTwofaUI();
    
    // Changement d'état lors du clic sur le bouton toggle
    twofaBtn.addEventListener('click', function() {
      twofaEnabled = !twofaEnabled;
      localStorage.setItem('twofa_enabled', twofaEnabled);
      updateTwofaUI();
    });
  });
  