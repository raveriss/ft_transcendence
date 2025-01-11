import os
import jwt
import datetime

def generate_jwt(user_id, username):
    secret_key = os.environ.get('SECRET_KEY', 'unsafe-default-key')
    expiration = datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    payload = {
        'user_id': user_id,
        'username': username,
        'exp': expiration,
        'iss': 'ConecteMe'
    }
    token = jwt.encode(payload, secret_key, algorithm='HS256')
    return token
