# Importation de la classe AppConfig depuis django.apps, utilisée pour configurer l'application.
from django.apps import AppConfig

# Définition de la configuration de l'application 'game'.
class GameConfig(AppConfig):
    # Spécifie le type de champ auto-incrémenté à utiliser pour les clés primaires par défaut.
    default_auto_field = 'django.db.models.BigAutoField'
    # Nom de l'application tel qu'il sera utilisé par Django.
    name = 'game'