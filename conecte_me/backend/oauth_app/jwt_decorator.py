# oauth_app/jwt_decorator.py
"""
Ce décorateur vérifie la présence d'un token JWT dans l'en-tête Authorization.
S'il est invalide ou absent, on renvoie un code 401 en JSON.
S'il est valide, on récupère l'utilisateur et on le stocke dans request.user.
"""
import jwt
from django.conf import settings
from django.http import JsonResponse
from oauth_app.models import User42  # Votre modèle utilisateur
from jwt import ExpiredSignatureError, InvalidTokenError

def jwt_required(view_func):
    def wrapper(request, *args, **kwargs):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith('Bearer '):
            print("JWT ERROR: Missing or invalid Authorization header")
            return JsonResponse({"detail": "Missing or invalid Authorization header"}, status=401)
        
        token = auth_header[len('Bearer '):]
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        except ExpiredSignatureError:
            print("JWT ERROR: Token expired")
            return JsonResponse({"detail": "Token expired"}, status=401)
        except InvalidTokenError:
            print("JWT ERROR: Invalid token")
            return JsonResponse({"detail": "Invalid token"}, status=401)

        user_id = payload.get('user_id')
        if user_id is None:
            print("JWT ERROR: user_id is None in payload")
            return JsonResponse({"detail": "Invalid token payload"}, status=401)
        
        try:
            user = User42.objects.get(user_id=user_id)
        except User42.DoesNotExist:
            print(f"JWT ERROR: user_id={user_id} not found in DB")
            return JsonResponse({"detail": "User not found"}, status=404)

        request.user = user
        return view_func(request, *args, **kwargs)
    return wrapper