// Gestion des boutons Login et Sign Up
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const connect42Btn = document.getElementById('connect-42');

loginBtn.addEventListener('click', () => {
  loginBtn.classList.add('btn-primary');
  signupBtn.classList.remove('btn-primary');
});

signupBtn.addEventListener('click', () => {
  signupBtn.classList.add('btn-primary');
  loginBtn.classList.remove('btn-primary');
});

// Redirection vers l'endpoint OAuth 42
connect42Btn.addEventListener('click', () => {
  window.location.href = 'https://localhost:8443/auth/42/login/';
});

// Gestion du token JWT dans l'URL
const urlParams = new URLSearchParams(window.location.search);
const jwt = urlParams.get('jwt');

if (jwt) {
  document.querySelector('.container').innerHTML = `
    <p class="text-success">Authentification réussie ! Votre token est : ${jwt}</p>
  `;
}
