document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    console.log('Email:', email);
    console.log('Mot de passe:', password);

    // Exemple de redirection après connexion réussie
    alert('Connexion réussie!');
    window.location.href = '/dashboard.html';
});
