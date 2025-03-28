# Importation du module os pour les opérations système (bien qu'il ne soit pas utilisé directement ici)
import os

# Importation de la bibliothèque jwt pour encoder et décoder des JSON Web Tokens (JWT)
import jwt

# Importation du module datetime pour manipuler les dates et heures
import datetime

# Importation des paramètres de configuration de Django, notamment pour accéder à SECRET_KEY
from django.conf import settings  # Importer les settings de Django

# Définition de la fonction generate_jwt qui génère un token JWT pour un utilisateur donné
def generate_jwt(user_id, username):


    # Récupération de la clé secrète définie dans settings.py pour signer le token
    secret_key = settings.SECRET_KEY

    # Définition de l'expiration du token : l'heure UTC actuelle plus 1 heure
    expiration = datetime.datetime.utcnow() + datetime.timedelta(hours=1)

    # Création du payload du token contenant les informations utilisateur et les métadonnées du token
    payload = {
        'user_id': user_id,       # Stocke l'identifiant unique de l'utilisateur
        'username': username,     # Stocke le nom d'utilisateur pour référence
        'exp': expiration,        # Date et heure d'expiration du token, après laquelle il ne sera plus valide
        'iss': 'ConecteMe'        # Identifiant de l'émetteur du token (issuer)
    }

    # Encodage du payload en un token JWT en utilisant la clé secrète et l'algorithme HS256
    token = jwt.encode(payload, secret_key, algorithm='HS256')

    # Retourne le token généré
    return token
