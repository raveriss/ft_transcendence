from django.db import models
from oauth_app.models import User42  # Votre modèle personnalisé

class GameSettings(models.Model):
    # On force la relation OneToOne à se baser sur le champ 'user_id' de User42,
    # et non sur la clé primaire par défaut.
    user = models.OneToOneField(
        User42,
        to_field='user_id',       # Utiliser le champ 'user_id' de User42 pour la relation
        db_column='user_id',      # La colonne en base sera nommée "user_id"
        on_delete=models.CASCADE,
        related_name='game_settings'
    )
    time = models.PositiveIntegerField(default=5)         # Temps en minutes (défaut : 5)
    score_limit = models.PositiveIntegerField(default=2)    # Score limite (défaut : 5)
    lives = models.PositiveIntegerField(default=3)          # Vies (défaut : 3)
    ball_speed = models.PositiveIntegerField(default=1)     # Vitesse de balle (défaut : 2)

    def __str__(self):
        return f"GameSettings for {self.user.username}"

# Signaux pour créer et sauvegarder automatiquement les réglages de jeu pour chaque nouvel utilisateur.
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User42)
def create_user_game_settings(sender, instance, created, **kwargs):
    if created:
        GameSettings.objects.create(user=instance)

@receiver(post_save, sender=User42)
def save_user_game_settings(sender, instance, **kwargs):
    if hasattr(instance, 'game_settings'):
        instance.game_settings.save()
