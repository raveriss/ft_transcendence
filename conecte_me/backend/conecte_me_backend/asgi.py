import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import chat.routing  # 🔥 Importe le fichier de routes WebSocket

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'conecte_me_backend.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),  # Gère les requêtes HTTP normales
    "websocket": AuthMiddlewareStack(
        URLRouter(chat.routing.websocket_urlpatterns)  # Gère les WebSockets
    ),
})
