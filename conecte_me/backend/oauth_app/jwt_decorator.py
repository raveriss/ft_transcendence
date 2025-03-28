# oauth_app/jwt_decorator.py
"""
Ce décorateur vérifie la présence d'un token JWT dans le cookie 'jwtToken'.
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
        # Récupère le token depuis le cookie sécurisé 'jwtToken'
        token = request.COOKIES.get('jwtToken', '')
        if not token:
            print("JWT ERROR: Token manquant dans le cookie")
            return JsonResponse({"detail": "Token manquant"}, status=401)
        
        try:
            # Décode le token en utilisant la clé secrète et l'algorithme HS256
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        except ExpiredSignatureError:
            print("JWT ERROR: Token expiré")
            return JsonResponse({"detail": "Token expiré"}, status=401)
        except InvalidTokenError:
            print("JWT ERROR: Token invalide")
            return JsonResponse({"detail": "Token invalide"}, status=401)

        # Récupère l'ID de l'utilisateur à partir du payload
        user_id = payload.get('user_id')
        if user_id is None:
            print("JWT ERROR: user_id est None dans le payload")
            return JsonResponse({"detail": "Payload de token invalide"}, status=401)
        
        try:
            # Recherche l'utilisateur dans la base de données
            user = User42.objects.get(user_id=user_id)
        except User42.DoesNotExist:
            print(f"JWT ERROR: user_id={user_id} non trouvé dans la base")
            return JsonResponse({"detail": "Utilisateur non trouvé"}, status=404)

        # Associe l'utilisateur à la requête pour utilisation dans la vue
        request.user = user
        return view_func(request, *args, **kwargs)
    return wrapper
