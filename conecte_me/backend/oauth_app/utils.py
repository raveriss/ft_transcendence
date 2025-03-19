import os
import jwt
import datetime
from django.conf import settings  # Importer les settings de Django

def generate_jwt(user_id, username):
    # Utiliser la même clé secrète que celle définie dans settings.py
    secret_key = settings.SECRET_KEY
    expiration = datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    payload = {
        'user_id': user_id,
        'username': username,
        'exp': expiration,
        'iss': 'ConecteMe'
    }
    token = jwt.encode(payload, secret_key, algorithm='HS256')
    return token
