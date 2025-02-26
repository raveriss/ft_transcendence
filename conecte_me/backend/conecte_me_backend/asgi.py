import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from oauth_app.routing import websocket_urlpatterns  # Assurez-vous que ce fichier existe

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'conecte_me_backend.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})

