import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import re_path
from oauth_app.consumers import PongGameConsumer  # Assure-toi que ce fichier existe

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'conecte_me_backend.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),  # Gère les requêtes HTTP classiques
    "websocket": AuthMiddlewareStack(
        URLRouter([
            re_path(r"ws/game/$", PongGameConsumer.as_asgi()),  # Route WebSocket
        ])
    ),
})
