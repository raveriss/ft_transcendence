from django.urls import re_path
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from oauth_app.consumers import GameConsumer

# application = ProtocolTypeRouter({
#     "websocket": AuthMiddlewareStack(
#         URLRouter([
#             re_path(r"ws/game/$", GameConsumer.as_asgi()),  # WebSocket route
#         ])
#     ),
# })

websocket_urlpatterns = [
    re_path(r"ws/game/$", GameConsumer.as_asgi()),
]