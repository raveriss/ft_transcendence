// frontend/static/js/2fa.js
document.addEventListener('DOMContentLoaded', function() {
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
});
