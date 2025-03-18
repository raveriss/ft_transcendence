import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'conecte_me_backend.settings')

# Application ASGI de base sans WebSockets (on les ajoutera plus tard)
application = ProtocolTypeRouter({
    "http": get_asgi_application(),
})
