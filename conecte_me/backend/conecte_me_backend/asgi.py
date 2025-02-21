# import os
# from django.core.asgi import get_asgi_application
# from channels.routing import ProtocolTypeRouter, URLRouter
# from channels.auth import AuthMiddlewareStack
# from django.urls import path
# from oauth_app import consumers

# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'conecte_me_backend.settings')

# application = ProtocolTypeRouter({
#     "http": get_asgi_application(),
#     "websocket": AuthMiddlewareStack(
#         URLRouter([
#             path("ws/game/", consumers.GameConsumer.as_asgi()),  # WebSocket URL
#         ])
#     ),
# })
