# oauth_app/jwt_decorator.py
"""
Ce décorateur vérifie la présence d'un token JWT dans l'en-tête Authorization.
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

        # Récupération de l'en-tête Authorization dans les métadonnées de la requête.
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')

        # Vérification que l'en-tête commence par "Bearer ", format requis pour un token JWT.
        if not auth_header.startswith('Bearer '):

            # Affichage d'un message d'erreur pour le débogage.
            print("JWT ERROR: Missing or invalid Authorization header")

            # Retourne une réponse JSON avec le détail de l'erreur et le statut HTTP 401 (non autorisé).
            return JsonResponse({"detail": "Missing or invalid Authorization header"}, status=401)
        
        # Extraction du token en retirant le préfixe "Bearer " de l'en-tête.
        token = auth_header[len('Bearer '):]
        try:

            # Décodage du token avec la clé secrète et l'algorithme HS256.
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
            print("JWT ERROR: user_id is None in payload")
            return JsonResponse({"detail": "Invalid token payload"}, status=401)
        
        try:

            # Tentative de récupération de l'utilisateur correspondant dans la base de données.
            user = User42.objects.get(user_id=user_id)

        # Si l'utilisateur n'existe pas, on retourne une réponse JSON indiquant que l'utilisateur n'a pas été trouvé.
        except User42.DoesNotExist:
            print(f"JWT ERROR: user_id={user_id} not found in DB")
            return JsonResponse({"detail": "User not found"}, status=404)

        # Affectation de l'utilisateur récupéré à request.user pour que la vue puisse l'utiliser.
        request.user = user

        # Appel de la fonction de vue originale avec la requête et les éventuels arguments supplémentaires.
        return view_func(request, *args, **kwargs)
    
    # Retourne le wrapper qui englobe la logique de vérification du token JWT.
    return wrapper