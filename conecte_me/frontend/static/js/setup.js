// Sélectionner tous les éléments de type range
const sliders = document.querySelectorAll('.form-range');

// Ajouter un événement de changement pour chaque slider
sliders.forEach(slider => {
  slider.addEventListener('input', function() {
    // Calculer la valeur du curseur en pourcentage
    const value = (this.value - this.min) / (this.max - this.min) * 100;

    // Mettre à jour la couleur de la barre de progression
    this.style.setProperty('--slider-value', value + '%');
  });

  // Initialiser la couleur au chargement
  const initialValue = (slider.value - slider.min) / (slider.max - slider.min) * 100;
  slider.style.setProperty('--slider-value', initialValue + '%');
});