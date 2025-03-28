# game/urls.py

# Importation de la fonction path pour définir des routes simples.
from django.urls import path
# Importation des vues utilisées pour traiter les requêtes liées au jeu.
from .views import game_settings_api, match_history_api, match_history_list, match_history_all, leaderboard, user_stats

# Définition des URL patterns pour l'application "game".
urlpatterns = [
    # Route par défaut qui appelle la vue game_settings_api.
    path('', game_settings_api, name='game_settings_api'),
    # Route pour gérer l'historique des matchs via l'API.
    path('match_history/', match_history_api, name='match_history_api'),
    # Route pour obtenir une liste des 3 dernier des matchs.
    path('match_history/list/', match_history_list, name='match_history_list'),
    # Route pour récupérer l'intégralité de l'historique des matchs.
    path('match_history/all/', match_history_all, name='match_history_all'),
    # Route pour afficher le leaderboard (classement) des joueurs.
    path('leaderboard/', leaderboard, name='leaderboard'),
    # Route pour obtenir les statistiques d'un utilisateur.
    path('user_stats/', user_stats, name='user_stats'),
]
