# backend/conecte_me_backend/settings.py
import os
from pathlib import Path
import logging


# Définition du répertoire de base du projet
BASE_DIR = Path(__file__).resolve().parent.parent

# Clé secrète (à garder secrète en production)
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'unsafe-secret-key')

# Ajoutez cette ligne pour utiliser votre modèle personnalisé
AUTH_USER_MODEL = 'oauth_app.User42'

# Mode débogage
DEBUG = os.environ.get('DEBUG', '1') == '1'

# Configuration des hôtes autorisés
ALLOWED_HOSTS = os.environ.get('DJANGO_ALLOWED_HOSTS', 'localhost,127.0.0.1,').split(',')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# Applications installées
INSTALLED_APPS = [
    'daphne',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Applications tierces
    'channels',
    'chat',
    'rest_framework',
    'oauth2_provider',

    # Applications personnalisées
    'oauth_app',
    'game',
]

# Middleware
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'conecte_me_backend.middleware.AuthenticationRequiredMiddleware',  # <-- Ajoutez cette ligne
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Configuration des URL
ROOT_URLCONF = 'conecte_me_backend.urls'

# Configuration des templates
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            BASE_DIR / 'templates',
            BASE_DIR / 'oauth_app' / 'templates',  # Ajout du dossier des templates de 2FA
        ],

        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

ASGI_APPLICATION = 'conecte_me_backend.asgi.application'

# Configuration WSGI
WSGI_APPLICATION = 'conecte_me_backend.wsgi.application'

# Configuration de la base de données
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('POSTGRES_DB', 'conecteme_db'),
        'USER': os.environ.get('POSTGRES_USER', 'conecteme_user'),
        'PASSWORD': os.environ.get('POSTGRES_PASSWORD', 'conecteme_password'),
        'HOST': os.environ.get('POSTGRES_HOST', 'db'),
        'PORT': os.environ.get('POSTGRES_PORT', '5432'),
    }
}

# Configuration Redis
REDIS_HOST = os.environ.get('REDIS_HOST', 'redis')  # Utilise le nom du service dans docker-compose
REDIS_PORT = os.environ.get('REDIS_PORT', '6379')

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": f"redis://{REDIS_HOST}:{REDIS_PORT}/1",
    }
}

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [(os.environ.get('REDIS_HOST', 'redis'), int(os.environ.get('REDIS_PORT', 6379)))]
        },
    },
}

# Configuration des mots de passe
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Paramètres de localisation
LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'Europe/Paris'
USE_I18N = True
USE_L10N = True
USE_TZ = True

# Configuration des fichiers statiques
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Configuration des fichiers médias
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Configuration des backends d'authentification
AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
    'oauth2_provider.backends.OAuth2Backend',
)

# Configuration des paramètres OAuth2
OAUTH2_PROVIDER = {
    'ACCESS_TOKEN_EXPIRE_SECONDS': 3600,
    'AUTHORIZATION_CODE_EXPIRE_SECONDS': 600,
    'OAUTH2_BACKEND_CLASS': 'oauth2_provider.oauth2_backends.OAuthLibCore',
    'OAUTH2_VALIDATOR_CLASS': 'oauth2_provider.oauth2_validators.OAuth2Validator',
    'SCOPES': {'public': 'Accès public'},
}

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'oauth2_provider.contrib.rest_framework.OAuth2Authentication',
    ),
}

# Configuration des informations client OAuth2
OAUTH42_WEBSITE = 'https://localhost:8443'
OAUTH42_CLIENT_ID = 'u-s4t2ud-212adcc9d7bcdde9f1b4072ac7e13a17ce8c3493475514c9c139b3f993a243a6'
OAUTH42_CLIENT_SECRET = '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'
OAUTH42_REDIRECT_URI = "/auth/42/callback"
OAUTH42_AUTH_URL = 'https://api.intra.42.fr/oauth/authorize'
OAUTH42_TOKEN_URL = 'https://api.intra.42.fr/oauth/token'
OAUTH42_USER_URL = 'https://api.intra.42.fr/v2/me'

# Configuration des e-mails
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
DEFAULT_FROM_EMAIL = 'webmaster@localhost'

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)
logger.debug(f"Connecting to DB: {DATABASES['default']}")

# Définition du répertoire où seront stockés les fichiers de logs.
BASE_DIR = Path(__file__).resolve().parent.parent
LOG_DIR = BASE_DIR / 'logs'
if not LOG_DIR.exists():
    LOG_DIR.mkdir(parents=True, exist_ok=True)

# Configuration de la journalisation (logging) de Django.
# Cette configuration est définie sous forme de dictionnaire et suit le schéma de configuration du module logging de Python.
LOGGING = {
    # Version du schéma de configuration du logging.
    'version': 1,
    'disable_existing_loggers': True,  # Désactive les loggers par défaut
    # Définition des formatters, qui déterminent le format des messages de log.
    'formatters': {
        # Formatter "verbose" : fournit des informations détaillées telles que le niveau, l'heure, le module, l'ID du processus, l'ID du thread et le message.
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',  # Utilisation du style "{" pour le formatage
        },
        # Formatter "simple" : affiche seulement le niveau de log et le message.
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },

    # Définition des handlers, qui déterminent où les messages de log seront envoyés.
    'handlers': {
        # Handler "file" : enregistre les logs dans un fichier.
        'file_backend': {
            'level': 'INFO',  # Seuls les messages d'INFO et plus sont enregistrés dans le fichier.
            'class': 'logging.handlers.TimedRotatingFileHandler',
            'filename': str(LOG_DIR / 'django.log'),
            'when': 'D',          # Rotation quotidienne
            'backupCount': 7,     # Conserver les 15 derniers fichiers (15 jours)
            'formatter': 'verbose',
            'delay': True,      # Ouverture du fichier seulement à la première écriture
            'utc': True,        # Utilise l'UTC pour déterminer le rollover
        },
        'file_frontend': {
            'level': 'INFO',
            'class': 'logging.FileHandler',  # Pas de rotation si vous préférez, ou adaptez si nécessaire
            'filename': str(LOG_DIR / 'frontend.log'),
            'formatter': 'verbose',
        },
        # Handler "console" : affiche les logs dans la console (stdout).
        'console': {
            'level': 'DEBUG',  # Affiche tous les messages de DEBUG et plus dans la console.
            'class': 'logging.StreamHandler',  # Utilise StreamHandler pour écrire dans la console.
            'formatter': 'simple',  # Utilise le formatter "simple".
        },
    },

    # Configuration des loggers pour différentes parties de l'application.
    'loggers': {
        # Logger pour Django (les messages émis par Django lui-même).
        'django': {
            'handlers': ['file_backend', 'console'],  # Envoie les logs à la fois dans le fichier et à la console.
            'level': 'INFO',  # Niveau minimum pour enregistrer les messages.
            'propagate': False,  # Empêche la duplication vers le logger racine
        },
        'frontend': {
            'handlers': ['file_frontend', 'console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}