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
		const historyStack = JSON.parse(sessionStorage.getItem('customHistory')) || [];
		const previous = historyStack[historyStack.length - 1];
	
		if (previous === '/home' || previous === '/signup' || previous === '/login') {
			// 🟢 On vient d'une page publique → on push
			navigateTo(data.redirect, true);
		} else if (previous === data.redirect) {
			// 🔁 Pas besoin d'y retourner
			console.log("Déjà sur la bonne page, aucune navigation");
		} else {
			// 🔁 Sinon on push aussi (et non replace !)
			navigateTo(data.redirect, true);
		}
	}})
    .catch(err => {
      console.error("Erreur réseau ou serveur : ", err);
      alert("Une erreur s'est produite. Veuillez réessayer.");
    });
  });
});

