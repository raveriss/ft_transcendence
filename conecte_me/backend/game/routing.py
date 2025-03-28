# Importation de re_path pour définir des URL basées sur des expressions régulières.
from django.urls import re_path
# Importation du module consumers qui contient les classes gérant les communications WebSocket.
from . import consumers

# Définition des URL pour les connexions WebSocket de l'application "game".
websocket_urlpatterns = [
    # Route WebSocket utilisant une expression régulière.
    # Lorsqu'un client se connecte à l'URL "ws/game/", 
    # la méthode as_asgi() de PongConsumer est appelée pour gérer la connexion.
    re_path(r'ws/game/$', consumers.PongConsumer.as_asgi()),
]