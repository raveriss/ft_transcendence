document.addEventListener('DOMContentLoaded', () => {
    // Récupération des éléments
    const cameraBtn = document.querySelector('.camera-icon');
    const avatarInput = document.getElementById('avatar-upload');
    const profileImage = document.getElementById('profile-image');
  
    // Au clic sur l'icône, déclenche la sélection de fichier
    cameraBtn.addEventListener('click', () => {
      avatarInput.click();
    });
  
    // Lorsque l'utilisateur sélectionne un fichier
    avatarInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
  
      // Optionnel : Vérification côté client du format et de la taille
      const allowedTypes = ['image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert("Format d'image non supporté. Seul JPEG et PNG sont autorisés.");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert("La taille de l'image ne doit pas dépasser 2MB.");
        return;
      }
  
      // Afficher un aperçu grâce à FileReader
      const reader = new FileReader();
      reader.onload = function(event) {
        profileImage.src = event.target.result;
      };
      reader.readAsDataURL(file);
  
      // Préparer l'envoi via FormData
      const formData = new FormData();
      formData.append('avatar', file);
  
      // Envoyer l'image au backend
      fetch('/auth/user/upload_avatar/', {
        method: 'POST',
        credentials: 'include', // Pour inclure les cookies de session
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Si le backend retourne l'URL de la nouvelle image, on peut mettre à jour la source
          if (data.profile_image_url) {
            profileImage.src = data.profile_image_url;
          }
          console.log("Avatar mis à jour avec succès.");
        } else {
          alert("Erreur lors de la mise à jour de l'avatar : " + data.error);
        }
      })
      .catch(error => {
        console.error("Erreur réseau :", error);
        alert("Erreur lors de l'envoi de l'image.");
      });
    });
  });
  