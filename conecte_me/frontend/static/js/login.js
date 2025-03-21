// frontend/static/js/login.js

document.addEventListener('DOMContentLoaded', function() {
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
      credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
      console.log("Réponse JSON du backend:", data);
      if (data.success) {
        // 1) Stocker le token si présent
        if (data.token) {
          localStorage.setItem('jwtToken', data.token);
        }
        // 2) Rediriger vers la page indiquée
        window.location.href = data.redirect;
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
