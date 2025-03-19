import os
import django
from django.core.wsgi import get_wsgi_application
from django.core.management import call_command

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'conecte_me_backend.settings')

# Initialiser Django (cela charge les apps, etc.)
django.setup()

# Tente de générer et d'appliquer les migrations pour l'application game
try:
    # Génère des migrations pour l'app game si des changements sont détectés
    call_command('makemigrations', 'game', interactive=False)
    # Applique toutes les migrations (pour toutes les apps)
    call_command('migrate', interactive=False)
    print("Migrations applied automatically.")
except Exception as e:
    print("Error applying migrations: ", e)

# Récupère l'application WSGI
application = get_wsgi_application()
