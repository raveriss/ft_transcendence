// frontend/static/js/login.js

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
  
    loginForm.addEventListener('submit', function(event) {
      event.preventDefault();
  
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();
  
      // On prépare les données en FormData
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
  
      // Appel AJAX/Fetch au backend Django
      fetch('/auth/login/', {
        method: 'POST',
        body: formData,
        credentials: 'include'
        // Pour Django, si vous utilisez le décorateur @csrf_exempt, 
        // vous n’avez pas besoin du header X-CSRFToken. Sinon, il faudrait l'ajouter.
      })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        if (data.success) {
          // Connexion réussie
          // Redirection vers board.html
          window.location.href = data.redirect; 
        } else {
          // Afficher l’erreur renvoyée par le backend
          alert(data.error || "Erreur de connexion");
        }
      })
      .catch(err => {
        console.error("Erreur réseau ou serveur : ", err);
        alert("Une erreur s'est produite. Veuillez réessayer.");
      });
    });
  });
  