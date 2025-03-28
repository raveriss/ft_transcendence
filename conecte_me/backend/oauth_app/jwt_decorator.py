# oauth_app/jwt_decorator.py
"""
Ce décorateur vérifie la présence d'un token JWT dans le cookie 'jwtToken'.
S'il est invalide ou absent, on renvoie un code 401 en JSON.
S'il est valide, on récupère l'utilisateur et on le stocke dans request.user.
"""

# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
# /*                      IMPORTS BIBLIOTHÈQUES TIERCES                        */
# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */

# Importation de la bibliothèque jwt pour manipuler et décoder les tokens JWT.
import jwt

# Importation des exceptions spécifiques pour gérer l'expiration ou l'invalidité du token.
from jwt import ExpiredSignatureError, InvalidTokenError




# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
# /*                      IMPORTS DU FRAMEWORK DJANGO                          */
# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */

# Importation des paramètres Django, notamment pour accéder à la clé secrète.
from django.conf import settings

# Importation de JsonResponse pour renvoyer des réponses HTTP au format JSON.
from django.http import JsonResponse




# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
# /*                 IMPORTS SPÉCIFIQUES À L'APPLICATION                       */
# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */

# Importation du modèle utilisateur User42 pour pouvoir récupérer l'utilisateur via son user_id contenu dans le token.
from oauth_app.models import User42




# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
# /*                       RÉPONSES D'ERREUR CÔTÉ CLIENT                       */
# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */

# Définition du décorateur jwt_required qui prend en argument une fonction de vue.
# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
# /*                 IMPORTS SPÉCIFIQUES À L'APPLICATION                       */
# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
def jwt_required(view_func):

    # Définition d'une fonction wrapper qui encapsule la logique de vérification du JWT.
    def wrapper(request, *args, **kwargs):
        # Récupère le token depuis le cookie sécurisé 'jwtToken'
        token = request.COOKIES.get('jwtToken', '')
        if not token:
            print("JWT ERROR: Token manquant dans le cookie")
            return JsonResponse({"detail": "Token manquant"}, status=401)
        
        try:
            # Décode le token en utilisant la clé secrète et l'algorithme HS256
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])

        # Gestion de l'exception si le token a expiré.
        except ExpiredSignatureError:
            print("JWT ERROR: Token expired")
            return JsonResponse({"detail": "Token expired"}, status=401)
        
        # Gestion de l'exception si le token est invalide.
        except InvalidTokenError:
            print("JWT ERROR: Invalid token")
            return JsonResponse({"detail": "Invalid token"}, status=401)
        
        # Extraction de l'identifiant utilisateur (user_id) contenu dans le payload du token.
        user_id = payload.get('user_id')

        # Vérification que le payload contient bien un user_id ; sinon, le token est considéré comme invalide.
        if user_id is None:
            print("JWT ERROR: user_id est None dans le payload")
            return JsonResponse({"detail": "Payload de token invalide"}, status=401)
        
        try:
            # Tentative de récupération de l'utilisateur correspondant dans la base de données.
            user = User42.objects.get(user_id=user_id)
        # Si l'utilisateur n'existe pas, on retourne une réponse JSON indiquant que l'utilisateur n'a pas été trouvé.
        except User42.DoesNotExist:
            print(f"JWT ERROR: user_id={user_id} non trouvé dans la base")
            return JsonResponse({"detail": "Utilisateur non trouvé"}, status=404)

        # Affectation de l'utilisateur récupéré à request.user pour que la vue puisse l'utiliser.
        request.user = user

        # Appel de la fonction de vue originale avec la requête et les éventuels arguments supplémentaires.
        return view_func(request, *args, **kwargs)
    # Retourne le wrapper qui englobe la logique de vérification du token JWT.
    return wrapper
