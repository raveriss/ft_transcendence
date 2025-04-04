// frontend/static/js/login.js

document.addEventListener('DOMContentLoaded', function() {
  changeLanguage(getCurrentLang());
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  loginForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    fetch('/auth/login/', {
      method: 'POST',
      body: formData,
      credentials: 'include' // Envoie les cookies avec la requête
    })
    .then(response => response.json())
    .then(data => {
      console.log("Réponse JSON du backend:", data);
      if (data.success && data.redirect) {
        // sessionStorage.setItem('forward', JSON.stringify([]));
        navigateTo(data.redirect); // SPA redirection propre
      } else {
        alert(data.error || "Erreur de connexion");
      }
    })
    .catch(err => {
      console.error("Erreur réseau ou serveur : ", err);
      alert("Une erreur s'est produite. Veuillez réessayer.");
    });
  });
});

