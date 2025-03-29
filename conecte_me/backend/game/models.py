# Importation du module models de Django pour créer des modèles de données.
from django.db import models
# Importation du modèle User42 depuis l'application oauth_app, qui représente les utilisateurs.
from oauth_app.models import User42

class GameSettings(models.Model):
# conecteme_db=# SELECT * FROM game_gamesettings;
#  id | time | score_limit | lives | ball_speed | map_choice | user_id | paddle_size | paddle_hit_sound_enabled | particles_enabled | test_dummy 
# ----+------+-------------+-------+------------+------------+---------+-------------+--------------------------+-------------------+------------
#   1 |    2 |           5 |     3 |          7 | retro      |       0 | medium      | t                        | t                 | f

    user = models.OneToOneField(
        User42,
        to_field='user_id',       # Utiliser le champ 'id' de User42 pour la relation
        db_column='user_id',  
        on_delete=models.CASCADE,
        related_name='game_settings'
    )
    time = models.PositiveIntegerField(default=2)         # Temps en minutes (défaut : 2)
    score_limit = models.PositiveIntegerField(default=5)    # Score limite (défaut : 5)
    lives = models.PositiveIntegerField(default=3)          # Vies (défaut : 3)
    ball_speed = models.PositiveIntegerField(default=7)     # Vitesse de balle (défaut : 7)
    map_choice = models.CharField(max_length=30, default='retro')
    paddle_size = models.CharField(
    max_length=10,
    choices=[('small', 'Small'), ('medium', 'Medium'), ('large', 'Large')],
    default='medium'
    )
    test_dummy = models.BooleanField(default=False) #À retirer
    particles_enabled = models.BooleanField(default=True)
    paddle_hit_sound_enabled = models.BooleanField(default=True)

    # Retourne une chaîne de caractères décrivant les paramètres de jeu avec le nom d'utilisateur associé.
    def __str__(self):
        return f"GameSettings for {self.user.username}"

# Importation du signal post_save, déclenché après la sauvegarde d'un modèle.
from django.db.models.signals import post_save
# Importation du décorateur receiver, qui permet de connecter une fonction à un signal.
from django.dispatch import receiver

# Lorsqu'un nouvel utilisateur est créé, on crée ses paramètres de jeu.
@receiver(post_save, sender=User42)
def create_user_game_settings(sender, instance, created, **kwargs):
    if created:
        GameSettings.objects.create(user=instance)

# À chaque mise à jour de l'utilisateur, on sauvegarde ses paramètres de jeu.
@receiver(post_save, sender=User42)
def save_user_game_settings(sender, instance, **kwargs):
    if hasattr(instance, 'game_settings'):
        instance.game_settings.save()


class MatchHistory(models.Model):
# conecteme_db=# SELECT * FROM game_matchhistory;
#  id |          match_date           | player2  | score1 | score2 | duration | recorded | player1_id 
# ----+-------------------------------+----------+--------+--------+----------+----------+------------
#   1 | 2025-03-28 12:34:01.642812+00 | Player 2 |      5 |      2 |       25 | t        |          1
#   2 | 2025-03-28 12:42:24.866238+00 | Raph     |      5 |      2 |       20 | t        |          1
#   3 | 2025-03-28 12:45:40.334877+00 | Player 2 |      5 |      3 |       14 | t        |          3
    match_date = models.DateTimeField(auto_now_add=True)
    player1 = models.ForeignKey(
        User42,
        on_delete=models.SET_NULL,
        null=True,
        related_name='matches_as_player1'
    )
    player2 = models.CharField(max_length=100)
    score1 = models.PositiveIntegerField()
    score2 = models.PositiveIntegerField()
    duration = models.PositiveIntegerField(help_text="Durée du match en secondes")
    recorded = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.match_date:%Y-%m-%d %H:%M} - {self.player1} vs {self.player2} : {self.score1} - {self.score2}"