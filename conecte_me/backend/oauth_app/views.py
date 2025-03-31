# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
# /*                            IMPORTS STANDARD                               */
# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */

# Importation du module os pour accéder aux variables d'environnement et aux fonctionnalités système.
import os

# Importation du module datetime pour gérer les dates et heures.
import datetime

# Importation du module json pour manipuler des données au format JSON.
import json

# Importation du module re pour travailler avec des expressions régulières.
import re


# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
# /*                      IMPORTS BIBLIOTHÈQUES TIERCES                        */
# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */

# Importation de la bibliothèque requests pour effectuer des requêtes HTTP.
import requests

# Importation de la bibliothèque jwt pour encoder et décoder des JSON Web Tokens.
import jwt

# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
# /*                      IMPORTS FRIENDSHIP                       */
# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */

from .utils import remove_friendship
from django.db.models import Q
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from oauth_app.models import User42
from oauth_app.models import Friendship, User42


# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
# /*                      IMPORTS DU FRAMEWORK DJANGO                          */
# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */

# Importation des fonctions redirect et render depuis django.shortcuts pour rediriger ou afficher des templates.
from django.shortcuts import redirect, render

# Importation de JsonResponse et HttpResponseRedirect depuis django.http pour renvoyer des réponses HTTP.
from django.http import JsonResponse, HttpResponseRedirect

# Importation de la fonction reverse depuis django.urls pour résoudre les noms d'URL en URL concrètes.
from django.urls import reverse

# Importation de get_random_string depuis django.utils.crypto pour générer des chaînes aléatoires (utilisé pour le state OAuth).
from django.utils.crypto import get_random_string

# Importation du décorateur csrf_exempt depuis django.views.decorators.csrf pour désactiver la vérification CSRF sur certaines vues.
from django.views.decorators.csrf import csrf_exempt

# Importation des fonctions check_password et make_password pour vérifier et hasher les mots de passe.
from django.contrib.auth.hashers import check_password, make_password

# Importation d'IntegrityError et transaction depuis django.db pour gérer les erreurs et transactions de la base de données.
from django.db import IntegrityError, transaction

# Importation de la fonction get_token depuis django.middleware.csrf pour générer ou récupérer un token CSRF.
from django.middleware.csrf import get_token

# Importation du module messages depuis django.contrib pour gérer les messages flash (feedback utilisateur).
from django.contrib import messages



# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
# /*                 IMPORTS SPÉCIFIQUES À L'APPLICATION                       */
# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */

# Importation des modèles User42 et UserLoginHistory depuis le module local models pour interagir avec la base de données.
from .models import User42, UserLoginHistory

# Réimportation des modèles User42 et UserLoginHistory (redondante avec l'import précédent) depuis le module local models.
from .models import User42, UserLoginHistory

# Importation de la fonction generate_jwt depuis le module utils pour générer des tokens JWT.
from .utils import generate_jwt



# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
# /*                   LOGGING & CONFIGURATION OAUTH42                         */
# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */

# Importation du module logging pour configurer et gérer les logs de l'application.
import logging

# Création d'un logger spécifique au module en utilisant le nom du module (__name__).
logger = logging.getLogger(__name__)



# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
# /*                           Env vars Auth OAuth42                           */
# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */

# Identifiant client OAuth 42
CLIENT_ID = os.environ.get('OAUTH42_CLIENT_ID')

# Secret client OAuth 42
CLIENT_SECRET = os.environ.get('OAUTH42_CLIENT_SECRET')

# URI de redirection OAuth 42
REDIRECT_URI = os.environ.get('OAUTH42_REDIRECT_URI')

# URL pour obtenir le token OAuth
TOKEN_URL = "https://api.intra.42.fr/oauth/token"

# URL pour lancer le processus d'autorisation
AUTHORIZE_URL = "https://api.intra.42.fr/oauth/authorize"


# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
# /*                                                                           */  
# /*               VUE DE REDIRECTION VERS L'AUTHENTIFICATION 42               */
# /*                                                                           */  
# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
def redirect_to_42(request):
    """
    Redirige vers la page d'authentification 42 en utilisant
    Authorization Code Grant. On génère un state random pour la protection CSRF.
    """
    # Génération d'une chaîne aléatoire de 32 caractères pour servir de state
    state = get_random_string(32)

    # Stockage du state généré dans la session pour vérification lors du callback OAuth
    request.session['oauth_state'] = state

    # Création d'un dictionnaire contenant les paramètres requis pour l'authentification OAuth
    params = {
        'client_id': CLIENT_ID,         # Identifiant du client OAuth
        'redirect_uri': REDIRECT_URI,   # URI de redirection après authentification
        'response_type': 'code',        # Type de réponse attendu (code d'autorisation)
        'scope': 'public',              # Étendue d'accès demandée
        'state': state,                 # Paramètre de sécurité pour prévenir les attaques CSRF
    }

    # Construction de la chaîne de requête en joignant chaque clé et valeur avec "&"
    query_string = "&".join([f"{k}={v}" for k, v in params.items()])

    # Construction de l'URL complète d'authentification en concaténant l'URL d'autorisation et la chaîne de requête
    auth_url = f"{AUTHORIZE_URL}?{query_string}"

    # Redirection de l'utilisateur vers l'URL d'authentification OAuth42
    return redirect(auth_url)




# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
# /*                                                                           */       
# /*       CALLBACK OAUTH 42 : CODE, TOKEN, SYNCHRONISATION, REDIRECTION       */
# /*                                                                           */       
# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
def callback_42(request):
    # /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
    # /*           Vérification de la présence du code OAuth dans l'URL            */
    # /*          Le "code" est le jeton temporaire renvoyé par l'API 42           */
    # /*    après authentification, indispensable pour obtenir un access token.    */                         */
    # /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
    code = request.GET.get('code')
    if not code:

        # Retourne une erreur si aucun code n'est présent, car l'échange pour un token ne peut se faire.
        return JsonResponse({"error": "No code provided"}, status=400)

    # /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
    # /*               Échange du code OAuth contre un access token                */
    # /*  On envoie une requête POST à l'API 42 pour échanger le code temporaire   */ 
    # /*                   contre un token d'accès qui permettra                   */
    # /*                  d'accéder aux informations utilisateur.                  */
    # /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
    data = {
        'grant_type': 'authorization_code',     # Spécifie le type de flux OAuth utilisé.
        'client_id': CLIENT_ID,                 # Identifiant de l'application OAuth42.
        'client_secret': CLIENT_SECRET,         # Secret de l'application OAuth42.
        'code': code,                           # Code reçu de l'API 42 après authentification.
        'redirect_uri': REDIRECT_URI,           # URI de redirection utilisée lors de la demande initiale.
    }
    try:

        # Envoi de la requête POST pour obtenir l'access token depuis l'API 42.
        token_response = requests.post(TOKEN_URL, data=data)

        # Conversion de la réponse en JSON afin d'extraire les informations.
        token_data = token_response.json()

        # Récupération du token d'accès à partir des données retournées.
        access_token = token_data.get('access_token')

        # Si l'access token n'est pas présent, retourner une erreur indiquant l'échec de l'échange.
        if not access_token:
            return JsonResponse({"error": "Failed to retrieve access token"}, status=400)
        
    # En cas d'exception lors de l'échange, retourner l'erreur rencontrée.
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

    # /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
    # /*         Récupération des informations utilisateur depuis l'API 42         */
    # /*  À l'aide de l'access token, on interroge l'API pour obtenir les détails  */
    # /*        de l'utilisateur connecté (id, login, email, prénom, etc.).        */
    # /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */

    # URL pour récupérer les informations de l'utilisateur.
    user_info_url = "https://api.intra.42.fr/v2/me"

    # Transmission de l'access token dans l'en-tête pour authentifier la requête.
    headers = {
        'Authorization': f"Bearer {access_token}"   
    }

    # Envoi d'une requête GET pour obtenir les informations de l'utilisateur.
    user_resp = requests.get(user_info_url, headers=headers)

    # Vérifie si la réponse de l'API est correcte (code HTTP 200).
    if user_resp.status_code != 200:

        # Retourne une erreur si l'API ne renvoie pas un statut 200 (succès).
        return JsonResponse({"error": "Failed to retrieve user info"}, status=400)
    
    # Conversion de la réponse en JSON pour pouvoir extraire les données utilisateur.
    user_data = user_resp.json()

    # /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
    # /*             Extraction et préparation des données utilisateur             */
    # /*     On extrait l'id, le login, l'email et le prénom de l'utilisateur.     */
    # /*  Si certains champs sont absents, des valeurs par défaut sont utilisées.  */
    # /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */

    # Identifiant unique de l'utilisateur fourni par l'API.
    user_id_42 = user_data['id']

    # Nom d'utilisateur (login) fourni par l'API.
    user_name_42 = user_data['login']

    # Email récupéré depuis l'API (peut être absent).
    email_from_api = user_data.get('email')

    # Prénom récupéré depuis l'API (peut être absent).
    first_name_from_api = user_data.get('first_name')

    # Utilisation d'une valeur par défaut pour l'email si non fourni par l'API.
    email_value = email_from_api if email_from_api else 'placeholder@example.com'
    
    # Utilisation d'une valeur par défaut pour le prénom si non fourni par l'API.
    first_name_value = first_name_from_api if first_name_from_api else 'Unknown'

    # /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
    # /*              Définition d'un mot de passe par défaut (haché)              */
    # /*     Pour les utilisateurs créés via OAuth, un mot de passe par défaut     */
    # /*  est généré et haché pour assurer la sécurité en cas d'usage ultérieur.   */
    # /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */

    # Hachage d'un mot de passe par défaut.
    default_password = make_password("42sch@@L")

    # /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
    # /*     Création ou mise à jour de l'utilisateur dans la base de données      */
    # /*       On vérifie si un utilisateur avec le même email existe déjà :       */
    # /*                - S'il existe,                                             */
    # /*                    mise a jour de ses informations                        */
    # /*                    réinitialise son mot de passe.                         */
    # /*                - Sinon,                                                   */
    # /*                    création d'un nouvel utilisateur                       */
    # /*                    avec un identifiant unique.                            */
    # /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
    try:

        # Démarrage d'une transaction atomique pour garantir la cohérence des opérations sur la base.
        with transaction.atomic():

            # Recherche d'un utilisateur existant avec le même email.
            user = User42.objects.filter(email_address=email_value).first()

            # Si l'utilisateur existe, on vérifie et met à jour les informations si elles diffèrent.
            if user:
                # Vérification et mise à jour des informations si elles diffèrent de celles de l'API.
                if (email_from_api and email_from_api != user.email_address) or \
                   (first_name_from_api and first_name_from_api != user.first_name):
                    user.email_address = email_from_api or user.email_address
                    user.first_name = first_name_from_api or user.first_name
                
                # Réinitialisation du mot de passe par default hache à la valeur par défaut.
                user.password = default_password

                # Indication que l'utilisateur est connecté (pour l'interface principale).
                user.is_connected = True

                # Enregistrement des mises à jour dans la base de données.
                user.save()
            else:

                # Attribution d'un identifiant unique pour le nouvel utilisateur.
                existing_ids = list(User42.objects.values_list('user_id', flat=True))

                # Tri des IDs pour faciliter la recherche de la plus petite valeur manquante.
                sorted_ids = sorted(existing_ids)

                # Détermination du plus petit user_id disponible.
                new_user_id = 0

                # Parcours des identifiants existants pour trouver le premier identifiant manquant.
                for uid in sorted_ids:
                    if uid == new_user_id:
                        new_user_id += 1
                    else:
                        break

                # Création d'un nouvel utilisateur avec les informations récupérées.
                user = User42(
                    user_id=new_user_id,            # Identifiant unique de l'utilisateur
                    username=user_name_42,          # Nom d'utilisateur 42
                    email_address=email_value,      # Email par défaut si non fourni
                    first_name=first_name_value,    # Prénom par défaut si non fourni  
                    password=default_password       # Le mot de passe est déjà haché.
                )

                # Enregistrement de l'utilisateur dans la base de données
                user.save()
    except IntegrityError:

        # En cas d'erreur d'intégrité (ex. violation de contrainte unique), retourner une erreur.
        return JsonResponse({"error": "Erreur lors de l'inscription de l'utilisateur"}, status=400)


    # /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
    # /*  Mise à jour de la session et enregistrement de l'historique de connexion      */
    # /*  On enregistre l'adresse IP et le navigateur de l'utilisateur pour le suivi,
    #     et on stocke l'ID utilisateur dans la session afin d'identifier l'utilisateur 
    #     authentifié lors des requêtes suivantes.                                  */
    # /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */

    # Mise à jour de la session pour que checkAuth détecte l'utilisateur authentifié
    ip_address = request.META.get('REMOTE_ADDR')

    # Récupération du user agent (informations sur le navigateur ou client) depuis les métadonnées.
    user_agent = request.META.get('HTTP_USER_AGENT', '')

    # Création d'une entrée dans l'historique des connexions pour enregistrer la connexion réussie.
    UserLoginHistory.objects.create(
        user=user,              # Utilisateur connecté
        ip_address=ip_address,  # Adresse IP de l'utilisateur
        user_agent=user_agent,  # Informations sur le navigateur
        is_connected=True       # Indique que l'utilisateur est connecté
    )

    # Stockage de l'identifiant de l'utilisateur et de son email dans la session pour l'authentification.
    request.session['user_id'] = user.pk
    request.session['email'] = user.email_address

    # Mise à jour de la session, création du log de connexion, etc.
    # jwt_token = generate_jwt(user_id=user.user_id, username=user_name_42)
    # response = HttpResponseRedirect(f"/board?jwt={jwt_token}")
    # return response
    jwt_token = generate_jwt(user_id=user.user_id, username=user_name_42)
    response = HttpResponseRedirect("/board")
    # Définir un cookie sécurisé :
    # - httponly=True empêche l'accès via JavaScript (augmente la sécurité)
    # - secure=True garantit que le cookie n'est envoyé que sur HTTPS
    # - samesite peut être 'Lax' ou 'Strict' selon vos besoins
    response.set_cookie(
        key="jwtToken", 
        value=jwt_token, 
        httponly=True, # Empêche l'accès via JavaScript
        secure=True, # Transmet uniquement sur HTTPS
        samesite="Lax"
    )
    return response




# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
# /*                                                                           */  
# /*                        VUE D'INSCRIPTION - SIGNUP                         */  
# /*                                                                           */  
# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
@csrf_exempt
def signup_view(request):
    # /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
    # /*        Vérification de la méthode HTTP et récupération des données        */
    # /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
    if request.method == 'POST':

        # Récupération des données du formulaire envoyées via POST

        # Prénom de l'utilisateur
        first_name   = request.POST.get('first_name')

        # Adresse e-mail de l'utilisateur
        email        = request.POST.get('email_address')

        # Mot de passe en clair, à hacher ensuite
        raw_password = request.POST.get('password')

        # Nom d'utilisateur (facultatif); sinon, valeur par défaut vide
        pseudo       = request.POST.get('username', '')

        # Vérification que les champs obligatoires (prénom, e-mail, mot de passe) sont présents
        if not all([first_name, email, raw_password]):

            # Retourne une réponse JSON avec une erreur si l'un des champs requis est manquant
            return JsonResponse(
                {"success": False, "error": "Tous les champs requis ne sont pas remplis."},
                status=400
            )

        # /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
        # /*                   Gestion de l'image de profil (optionnelle)                */
        # /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */

        # Récupération du fichier image envoyé sous le champ "avatar"
        profile_image = request.FILES.get('avatar')
        if profile_image:

            # Limiter la taille du fichier à 2MB
            if profile_image.size > 2 * 1024 * 1024:
                return JsonResponse(
                    {"success": False, "error": "La taille de l'image ne doit pas dépasser 2MB."},
                    status=400
                )
            
            # Vérifier le type MIME (Multipurpose Internet Mail Extensions)
            if profile_image.content_type not in ['image/jpeg', 'image/png']:
                return JsonResponse(
                    {"success": False, "error": "Format d'image non supporté. Seul JPEG et PNG sont autorisés."},
                    status=400
                )

        # /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
        # /*             Création ou mise à jour de l'utilisateur en base              */
        # /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
        try:

            # Démarrage d'une transaction atomique pour garantir que toutes les opérations de base se réalisent ensemble
            with transaction.atomic():

                # Récupération de tous les identifiants utilisateur existants afin de déterminer le prochain user_id libre
                existing_ids = list(User42.objects.values_list('user_id', flat=True))

                # Tri des identifiants pour faciliter la détection du premier identifiant manquant
                sorted_ids = sorted(existing_ids)

                # Déterminer le plus petit user_id disponible
                new_user_id = 0
                for uid in sorted_ids:
                    if uid == new_user_id:
                        new_user_id += 1
                    else:
                        # Dès qu'on trouve un gap, on arrête : new_user_id est disponible
                        break

                # Création de l'utilisateur avec les données du formulaire et le user_id calculé
                user = User42(
                    user_id=new_user_id,

                    # Utilise le pseudo fourni, ou sinon extrait la partie avant le "@" de l'email comme nom d'utilisateur
                    username=pseudo or email.split('@')[0],
                    first_name=first_name,
                    email_address=email,
                )

                # Hachage du mot de passe pour le stocker de manière sécurisée
                user.password = make_password(raw_password)

                # Si une image de profil a été fournie et validée, l'associer à l'utilisateur
                if profile_image:
                    user.profile_image = profile_image

                # Sauvegarde de l'utilisateur dans la base de données
                user.save()

        except IntegrityError:

            # Gestion d'une erreur d'intégrité (par exemple, adresse e-mail déjà utilisée)
            return JsonResponse(
                {"success": False, "error": "Cette adresse e-mail est déjà utilisée."},
                status=400
            )

        # Retourne une réponse JSON indiquant que l'inscription a réussi, avec un code de statut 201 (créé)
        return JsonResponse(
            {"success": True, "detail": "Inscription réussie."},
            status=201
        )

    # Si la méthode HTTP n'est pas POST, retourne une erreur indiquant que la méthode n'est pas autorisée (405)
    return JsonResponse(
        {"success": False, "error": "Méthode non autorisée."},
        status=405
    )

# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
# /*                                                                           */  
# /*                             VUE DE DÉCONNEXION                            */  
# /*                                                                           */  
# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
@csrf_exempt
def logout_view(request):
    """
    Vue de déconnexion qui met à jour is_connected à False,
    puis nettoie la session et redirige vers /home.
    """

    # Récupération de l'ID utilisateur depuis la session
    user_id = request.session.get('user_id')

    # Si l'ID utilisateur est présent dans la session, on met à jour le log de connexion
    if user_id:
        try:

            # /* Mise à jour du log de connexion : on récupère l'utilisateur et son dernier log */
            user = User42.objects.get(pk=user_id)

            # Récupération du dernier log de connexion de l'utilisateur
            last_login = UserLoginHistory.objects.filter(user=user).order_by('-timestamp').first()

            # Si un dernier log existe, on met à jour le champ is_connected à False
            if last_login:

                # Mise à jour du dernier log pour indiquer que l'utilisateur n'est plus connecté
                last_login.is_connected = False

                # Sauvegarde des modifications dans la base de données
                last_login.save()

        # Si l'utilisateur n'existe pas, on ignore l'erreur et on continue la déconnexion        
        except User42.DoesNotExist:

            # Si l'utilisateur n'existe pas, ignorer et poursuivre la déconnexion
            pass

    # Nettoyage complet de la session pour supprimer toutes les informations d'authentification
    request.session.flush()
    # Créer une réponse JSON
    response = JsonResponse({"success": True, "redirect": "/home"}, status=200)
    # Supprimer le cookie jwtToken en le définissant avec une date d'expiration passée
    response.delete_cookie('jwtToken')
    return response




# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
# /*                                                                           */  
# /*               VUE POUR RÉCUPÉRER L'HISTORIQUE DE CONNEXION                */
# /*                                                                           */  
# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
@csrf_exempt
def user_login_history(request):
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'error': 'User not authenticated'}, status=401)
    try:
        user = User42.objects.get(pk=user_id)
    except User42.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

    # Récupérer les 3 dernières connexions
    logs = UserLoginHistory.objects.filter(user=user)[:3]

    # Créer une liste de dictionnaires pour les logs de connexion
    data = [
        {
            'timestamp': log.timestamp.isoformat(),     # Conversion de la date en chaîne ISO
            'ip_address': log.ip_address,               # Adresse IP de l'utilisateur
            'user_agent': log.user_agent,               # Informations sur le navigateur
            'is_connected': log.is_connected            # Conversion de 't' en booléen
        }
        for log in logs
    ]

    # Retourne les logs de connexion sous forme de réponse JSON
    return JsonResponse({'login_history': data})




# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
# /*                                                                           */  
# /*                     🔐 VUE DE CONNEXION - `/LOGIN` 🔐                     */
# /*                                                                           */  
# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
@csrf_exempt
def login_view(request):
    """
    Cette vue gère l'authentification de l'utilisateur. Elle récupère les champs 'email' et 'password' envoyés via POST,
    vérifie leur validité par rapport aux données stockées, et si l'authentification est réussie, met à jour la session,
    génère un token JWT, et redirige l'utilisateur soit vers la configuration de la 2FA, soit directement vers l'interface principale.
    En cas d'échec ou si la méthode HTTP n'est pas POST, une réponse JSON d'erreur est retournée.
    """
    if request.method == 'POST':

        # Récupération des champs 'email' et 'password' envoyés via POST
        email = request.POST.get('email')
        password = request.POST.get('password')

        # Vérification que les deux champs requis sont fournis
        if not email or not password:
            return JsonResponse({
                "success": False,
                "error": "Champs 'email' et 'password' requis."
            }, status=400)

        # Recherche de l'utilisateur correspondant à l'adresse e-mail fournie
        user = User42.objects.filter(email_address=email).first()

        # Si aucun utilisateur n'est trouvé, retourner une erreur d'authentification
        if not user:

            # Retourne une réponse JSON indiquant l'échec de l'authentification
            return JsonResponse({
                "success": False,
                "error": "Email ou mot de passe incorrect."
            }, status=401)

        # Vérification du mot de passe haché stocké par rapport au mot de passe fourni
        if check_password(password, user.password):
            # Authentification réussie : mise à jour de la session
            request.session['user_id'] = user.pk
            request.session['email'] = user.email_address

            # Génération du token JWT
            jwt_token = generate_jwt(user_id=user.user_id, username=user.username)
            
            # Si 2FA n'est pas encore activé, rediriger vers la configuration 2FA
            if user.is_2fa_enabled:

                # Retourne une réponse JSON indiquant le succès de l'authentification et la redirection vers la configuration 2FA
                # On va stocker le token dans un cookie sécurisé
                response = JsonResponse({
                    "success": True,
                    "redirect": "/auth/2fa/setup/",
                }, status=200)
                response.set_cookie(
                    key="jwtToken",
                    value=jwt_token,
                    httponly=True,  # Empêche l'accès via JavaScript
                    secure=True,    # Transmet uniquement sur HTTPS
                    samesite="Lax"  # Selon vos besoins
                )
                return response
            else:

                # Enregistrement de l'adresse IP et du navigateur de l'utilisateur pour le suivi
                ip_address = request.META.get('REMOTE_ADDR')

                # Récupération du user agent (informations sur le navigateur ou client) depuis les métadonnées
                user_agent = request.META.get('HTTP_USER_AGENT', '')

                # Création d'une entrée dans l'historique des connexions pour enregistrer la connexion réussie
                UserLoginHistory.objects.create(
                    user=user,
                    ip_address=ip_address,
                    user_agent=user_agent,
                    is_connected=True
                )

                # Retourne une réponse JSON indiquant le succès de l'authentification et la redirection vers l'interface principale
                # On va stocker le token dans un cookie sécurisé
                response = JsonResponse({
                    "success": True,
                    "redirect": "/board"
                }, status=200)
                response.set_cookie(
                    key="jwtToken",
                    value=jwt_token,
                    httponly=True,  # Empêche l'accès via JavaScript
                    secure=True,    # Transmet uniquement sur HTTPS
                    samesite="Lax"  # Selon vos besoins
                )
                return response

        # Si le mot de passe ne correspond pas, retourner une erreur d'authentification
        return JsonResponse({
            "success": False,
            "error": "Email ou mot de passe incorrect."
        }, status=401)
    
    # Si la méthode HTTP n'est pas POST, retourner une erreur indiquant que la méthode n'est pas autorisée (405)
    return JsonResponse({
        "success": False,
        "error": "Méthode non autorisée."
    }, status=405)




# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
# /*                                                                           */  
# /*  RÉCUPÉRATION DES INFOS UTILISATEUR VIA LA SESSION & GESTION DES ERREURS  */
# /*                                                                           */  
# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
def user_info(request):

    # 🐛 Affichage d'un log de débug pour la session
    logger.debug("Appel de user_info, session: %s", dict(request.session))

    # 📥🆔 Récupération de l'ID utilisateur depuis la session
    user_id = request.session.get('user_id')

    # 🔎🆔 Vérification de l'authentification : erreur si aucun ID trouvé
    if not user_id:
        logger.error("Aucun user_id dans la session !")
        return JsonResponse({'error': 'User not authenticated'}, status=401)
    try:

        # 📥👤 Récupération de l'utilisateur via son ID
        user = User42.objects.get(pk=user_id)
        logger.debug("Utilisateur trouvé : %s", user.username)

        # 📤 Retour d'un JsonResponse contenant les informations utilisateur
        return JsonResponse({
            'username': user.username,
            'profile_image': user.profile_image.url,
            'is_2fa_enabled': user.is_2fa_enabled  # Ajouté ici
        })
    except User42.DoesNotExist:

        # 🚨 Gestion d'exception : utilisateur non trouvé pour l'ID fourni
        logger.error("Utilisateur non trouvé pour user_id=%s", user_id)
        return JsonResponse({'error': 'User not found'}, status=404)


# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
# /*                                                                           */  
# /*                🍪🌐🎯🔎📤📥📦📝🗑🔒🔑🔗🔬🩻🪪🚹🛃⛔🔄🔁❓                */
# /*               💱✅❌🆔🏁🚩👌👤🚨🚧🎫🎯💳📎🪦🪧💊🩹📡🔬📢                */
# /*                                                                           */ 
# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */

# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
# /*                                                                           */  
# /*  RÉCUPÉRATION DES INFOS UTILISATEUR VIA LA SESSION & GESTION DES ERREURS  */
# /*                                                                           */  
# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
@csrf_exempt
def upload_avatar_view(request):

    # 🔄 Vérification de la méthode HTTP utilisée
    if request.method == 'POST':
        
        # 📤🔑 Vérification de l'authentification via la session
        user_id = request.session.get('user_id')

        # 🔬 Récupération de l'utilisateur via son ID
        if not user_id:

            # 🚨 Retour d'erreur si l'utilisateur n'est pas authentifié
            return JsonResponse({"success": False, "error": "Utilisateur non authentifié."}, status=401)
        
        # 🚧 
        try:
            user = User42.objects.get(pk=user_id)

        # 🚨 Gestion d'exception : utilisateur non trouvé pour l'ID fourni    
        except User42.DoesNotExist:

            # 🚨 Retour d'erreur si l'utilisateur n'est pas trouvé
            return JsonResponse({"success": False, "error": "Utilisateur non trouvé."}, status=404)

        # Récupération du fichier envoyé
        avatar_file = request.FILES.get('avatar')

        # 🔬 Vérification de la présence d'un fichier
        if not avatar_file:
            return JsonResponse({"success": False, "error": "Aucun fichier envoyé."}, status=400)

        # 🔬 Vérification de la taille du fichier (limite à 2MB)
        if avatar_file.size > 2 * 1024 * 1024:

            # 📢 Retour d'erreur si la taille du fichier dépasse 2MB
            return JsonResponse({"success": False, "error": "La taille de l'image ne doit pas dépasser 2MB."}, status=400)

        # 🔬 Vérification du format du fichier (JPEG/PNG uniquement)
        if avatar_file.content_type not in ['image/jpeg', 'image/png']:
            return JsonResponse({"success": False, "error": "Format d'image non supporté."}, status=400)

        # 📤👤 Sauvegarde du nouvel avatar dans le modèle (mise à jour du champ profile_image)
        user.profile_image = avatar_file

        # 📦 Enregistrement des modifications dans la base de données
        user.save()

        # ✅ Retour de l'URL de la nouvelle image pour mise à jour immédiate côté client
        return JsonResponse({"success": True, "profile_image_url": user.profile_image.url}, status=200)
    else:

        # 🚫 Retour d'erreur si la méthode HTTP utilisée n'est pas POST
        return JsonResponse({"success": False, "error": "Méthode non autorisée."}, status=405)

# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
# /*                                                                           */
# /*                  VUE DE RÉINITIALISATION DE MOT DE PASSE                  */
# /*                                                                           */
# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
@csrf_exempt
def set_42_password_view(request):
    """
    Réception du mot de passe saisi par l’utilisateur lors de sa première connexion via 42.
    Le mot de passe est validé, haché et stocké temporairement dans la session.
    """
    if request.method == 'POST':

        # Récupération des champs 'password' et 'confirmPassword' depuis le POST
        password = request.POST.get('password')
        confirm = request.POST.get('confirmPassword')

        # Vérification que les deux champs sont fournis et identiques
        if not password or not confirm or password != confirm:

            # Retourne une réponse JSON avec une erreur si les mots de passe ne correspondent pas
            return JsonResponse({"success": False, "error": "Les mots de passe ne correspondent pas."}, status=400)

        # Vérification côté serveur : minimum 8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial
        pattern = r'^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$'

        # Vérification du format du mot de passe
        if not re.match(pattern, password):

            # Retourne une réponse JSON avec une erreur si le mot de passe ne respecte pas les critères
            return JsonResponse({"success": False, "error": "Le mot de passe ne respecte pas les critères de sécurité."}, status=400)

        # Hachage sécurisé du mot de passe
        hashed_password = make_password(password)

        # Stockage temporaire dans la session
        request.session['temp_hashed_password'] = hashed_password

        # Retour de succès et message de redirection
        return JsonResponse({
            "success": True,
            "detail": "Mot de passe défini avec succès. Vous allez être redirigé vers l'authentification 42."
        }, status=200)
    else:

        # Retourne une réponse JSON avec une erreur si la méthode n'est pas POST
        return JsonResponse({"success": False, "error": "Méthode non autorisée."}, status=405)



# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
# /*                                                                           */
# /*                             UPDATE EMAIL VIEW                             */
# /*                                                                           */
# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
@csrf_exempt
def update_email_view(request):
    
    if request.method != 'POST':

        # Retourne une réponse JSON avec une erreur si la méthode n'est pas POST
        return JsonResponse({"success": False, "error": "Méthode non autorisée."}, status=405)
    
    # Vérifier que l'utilisateur est authentifié via la session
    user_id = request.session.get('user_id')

    # Si l'utilisateur n'est pas authentifié, retourner une erreur
    if not user_id:

        # Retourne une réponse JSON avec une erreur si l'utilisateur n'est pas authentifié
        return JsonResponse({"success": False, "error": "Utilisateur non authentifié."}, status=401)
    
    # Récupérer l'utilisateur via son ID
    try:
        user = User42.objects.get(pk=user_id)

    # Si l'utilisateur n'existe pas, retourner une erreur
    except User42.DoesNotExist:
        return JsonResponse({"success": False, "error": "Utilisateur non trouvé."}, status=404)
    
    # Extraction du JSON envoyé dans le corps de la requête
    try:
        data = json.loads(request.body)
    except Exception:
        return JsonResponse({"success": False, "error": "JSON invalide."}, status=400)
    
    current_email = data.get('current_email', '').strip()
    new_email = data.get('new_email', '').strip()
    password = data.get('password', '')

    # Vérification que l'email actuel correspond à celui enregistré
    if current_email != user.email_address:
        return JsonResponse({"success": False, "error": "L'email actuel ne correspond pas."}, status=400)
    
    # Vérifier le format du nouvel email
    email_regex = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
    if not re.match(email_regex, new_email):
        return JsonResponse({"success": False, "error": "Le nouvel email n'est pas valide."}, status=400)
    
    # Vérifier que le nouvel email n'est pas déjà utilisé par un autre compte
    if User42.objects.filter(email_address=new_email).exclude(pk=user_id).exists():
        return JsonResponse({"success": False, "error": "Cet email est déjà utilisé par un autre compte."}, status=400)
    
    # Vérifier que le mot de passe est correct
    if not check_password(password, user.password):
        return JsonResponse({"success": False, "error": "Mot de passe incorrect."}, status=400)
    
    # Tout est validé : mise à jour de l'email
    user.email_address = new_email
    user.save()
    
    # Mettre à jour éventuellement la session
    request.session['email'] = new_email
    
    return JsonResponse({"success": True, "detail": "Email mis à jour avec succès."}, status=200)

@csrf_exempt
def update_username_view(request):
    if request.method != 'POST':
        return JsonResponse({"success": False, "error": "Méthode non autorisée."}, status=405)

    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({"success": False, "error": "Utilisateur non authentifié."}, status=401)

    try:
        user = User42.objects.get(pk=user_id)
    except User42.DoesNotExist:
        return JsonResponse({"success": False, "error": "Utilisateur non trouvé."}, status=404)

    try:
        data = json.loads(request.body)
    except Exception:
        return JsonResponse({"success": False, "error": "JSON invalide."}, status=400)

    new_username = data.get("new_username", "").strip()
    password = data.get("password", "")

    if not new_username or not password:
        return JsonResponse({"success": False, "error": "Champs requis manquants."}, status=400)

    if not check_password(password, user.password):
        return JsonResponse({"success": False, "error": "Mot de passe incorrect."}, status=400)

    if User42.objects.filter(username=new_username).exclude(pk=user_id).exists():
        return JsonResponse({"success": False, "error": "Ce nom d'utilisateur est déjà pris."}, status=400)

    user.username = new_username
    user.save()

    return JsonResponse({"success": True, "detail": "Nom d'utilisateur mis à jour avec succès."}, status=200)




@csrf_exempt
def update_password_view(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "error": "Méthode non autorisée."}, status=405)
    
    # Vérifier que l'utilisateur est authentifié via la session
    user_id = request.session.get("user_id")
    if not user_id:
        return JsonResponse({"success": False, "error": "Utilisateur non authentifié."}, status=401)
    
    # Extraction des données JSON
    try:
        data = json.loads(request.body)
    except Exception:
        return JsonResponse({"success": False, "error": "JSON invalide."}, status=400)
    
    current_password = data.get("current_password", "").strip()
    new_password = data.get("new_password", "").strip()
    confirm_password = data.get("confirm_password", "").strip()
    
    # Vérification que tous les champs sont présents
    if not current_password or not new_password or not confirm_password:
        return JsonResponse({"success": False, "error": "Tous les champs sont requis."}, status=400)
    
    # Vérification de la correspondance des nouveaux mots de passe
    if new_password != confirm_password:
        return JsonResponse({"success": False, "error": "Les nouveaux mots de passe ne correspondent pas."}, status=400)
    
    # Vérification des critères de sécurité
    password_pattern = r"^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$"
    if not re.match(password_pattern, new_password):
        return JsonResponse({"success": False, "error": "Le nouveau mot de passe ne respecte pas les critères de sécurité."}, status=400)
    
    # Récupération de l'utilisateur
    try:
        user = User42.objects.get(pk=user_id)
    except User42.DoesNotExist:
        return JsonResponse({"success": False, "error": "Utilisateur non trouvé."}, status=404)
    
    # Vérification du mot de passe actuel
    if not check_password(current_password, user.password):
        return JsonResponse({"success": False, "error": "Mot de passe actuel incorrect."}, status=400)
    
    # Vérifier que le nouveau mot de passe est différent de l'ancien
    if current_password == new_password:
        return JsonResponse({"success": False, "error": "Votre nouveau mot de passe doit être différent de l'ancien."}, status=400)
    
    # Tout est validé : hachage et mise à jour du mot de passe
    user.password = make_password(new_password)
    user.save()
    
    return JsonResponse({"success": True, "detail": "Mot de passe mis à jour avec succès."}, status=200)

@csrf_exempt
def export_data_view(request):
    """
    Vue permettant d’exporter les données personnelles de l’utilisateur
    au format JSON. La réponse contient un header Content-Disposition afin
    d’indiquer qu’il s’agit d’un fichier téléchargeable.
    """
    if request.method != "GET":
        return JsonResponse({"success": False, "error": "Méthode non autorisée."}, status=405)

    user_id = request.session.get("user_id")
    if not user_id:
        return JsonResponse({"success": False, "error": "Utilisateur non authentifié."}, status=401)

    try:
        user = User42.objects.get(pk=user_id)
    except User42.DoesNotExist:
        return JsonResponse({"success": False, "error": "Utilisateur non trouvé."}, status=404)

    # Préparer les données à exporter
    data = {
        "user_id": user.user_id,
        "username": user.username,
        "email_address": user.email_address,
        "first_name": user.first_name,
        "is_2fa_enabled": user.is_2fa_enabled,
        "profile_image": user.profile_image.url if user.profile_image else "",
        "created_at": user.created_at.isoformat()
    }

    response = JsonResponse(data)
    response['Content-Disposition'] = 'attachment; filename="mes_donnees.json"'
    return response

@csrf_exempt
def delete_account_view(request):
    """
    Vue permettant de supprimer complètement le compte de l’utilisateur.
    Elle supprime l’utilisateur de la table User42 ainsi que les fichiers médias liés,
    nettoie la session et renvoie une réponse JSON confirmant la suppression.
    """
    if request.method != "POST":
        return JsonResponse({"success": False, "error": "Méthode non autorisée."}, status=405)

    user_id = request.session.get("user_id")
    if not user_id:
        return JsonResponse({"success": False, "error": "Utilisateur non authentifié."}, status=401)

    try:
        user = User42.objects.get(pk=user_id)
    except User42.DoesNotExist:
        return JsonResponse({"success": False, "error": "Utilisateur non trouvé."}, status=404)

    # Suppression de l'image de profil si elle n'est pas celle par défaut
    if user.profile_image and user.profile_image.name != 'profile_pictures/default_avatar.png':
        image_path = user.profile_image.path
        if os.path.exists(image_path):
            os.remove(image_path)

    # Supprimer l'utilisateur (et toutes les données associées)
    user.delete()

    # Nettoyer la session
    request.session.flush()

    return JsonResponse({"success": True, "detail": "Compte supprimé avec succès."})

@csrf_exempt
def update_login_status(request):
    if request.method == "POST":
        user_id = request.session.get('user_id')
        if not user_id:
            logger.error("Aucun user_id dans la session")
            return JsonResponse({"success": False, "error": "Utilisateur non authentifié."}, status=401)
        
        try:
            user = User42.objects.get(pk=user_id)
        except User42.DoesNotExist:
            logger.error("Utilisateur non trouvé pour user_id=%s", user_id)
            return JsonResponse({"success": False, "error": "Utilisateur non trouvé."}, status=404)
        
        try:
            data = json.loads(request.body)
            is_connected = data.get('is_connected', False)
            if not isinstance(is_connected, bool):
                logger.error("'is_connected' n'est pas un booléen: %s", data.get('is_connected'))
                return JsonResponse({"success": False, "error": "'is_connected' doit être un booléen."}, status=400)
        except json.JSONDecodeError:
            logger.error("Données mal formatées: %s", request.body)
            return JsonResponse({"success": False, "error": "Données mal formatées."}, status=400)
        
        last_login = UserLoginHistory.objects.filter(user=user).order_by('-timestamp').first()
        if last_login:
            logger.info("Mise à jour du log id=%s pour user_id=%s : is_connected=%s", last_login.id, user_id, is_connected)
            last_login.is_connected = is_connected
            last_login.save()
        else:
            logger.info("Aucun log existant pour user_id=%s, création d'un nouveau log.", user_id)
            UserLoginHistory.objects.create(user=user, is_connected=is_connected)
    
        return JsonResponse({"success": True, "detail": "Statut de connexion mis à jour."}, status=200)
    
    return JsonResponse({"success": False, "error": "Méthode non autorisée."}, status=405)

@csrf_exempt
def toggle_2fa(request):
    """
    Cette vue met à jour la valeur de 'is_2fa_enabled' dans la base de données
    lorsqu'un utilisateur clique sur le bouton pour activer/désactiver 2FA.
    """
    if request.method == 'POST':
        user_id = request.session.get('user_id')
        if not user_id:
            return JsonResponse({"success": False, "error": "Utilisateur non authentifié."}, status=401)
        
        try:
            user = User42.objects.get(pk=user_id)
        except User42.DoesNotExist:
            return JsonResponse({"success": False, "error": "Utilisateur non trouvé."}, status=404)

        # Inverser la valeur de 'is_2fa_enabled'
        user.is_2fa_enabled = not user.is_2fa_enabled
        user.save()

        return JsonResponse({"success": True, "is_2fa_enabled": user.is_2fa_enabled})
    
    return JsonResponse({"success": False, "error": "Méthode non autorisée."}, status=405)

# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
# /*                   FRIENDSHIP                                              */
# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */


@csrf_exempt
def remove_friend_view(request):
    """
    Vue pour refuser une demande d'ami ou supprimer un ami existant.
    Elle prend en paramètre `target_id` : l'ID de l'utilisateur concerné.
    """
    from .utils import remove_friendship

    if request.method != "POST":
        return JsonResponse({"success": False, "error": "Méthode non autorisée."}, status=405)

    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({"success": False, "error": "Utilisateur non authentifié."}, status=401)

    try:
        user = User42.objects.get(pk=user_id)
    except User42.DoesNotExist:
        return JsonResponse({"success": False, "error": "Utilisateur introuvable."}, status=404)

    # Extraction du corps JSON
    try:
        data = json.loads(request.body)
        target_id = data.get('target_id')
        if target_id is None:
            return JsonResponse({"success": False, "error": "Champ 'target_id' manquant."}, status=400)
    except Exception:
        return JsonResponse({"success": False, "error": "Format JSON invalide."}, status=400)

    # Récupération de l'autre utilisateur
    try:
        target_user = User42.objects.get(user_id=target_id)
    except User42.DoesNotExist:
        return JsonResponse({"success": False, "error": "Utilisateur ciblé introuvable."}, status=404)

    # Appel de la fonction utilitaire
    success, message = remove_friendship(user, target_user)
    status_code = 200 if success else 400

    return JsonResponse({"success": success, "message": message}, status=status_code)

@csrf_exempt
def friend_request_view(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Méthode non autorisée.'}, status=405)

    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Utilisateur non authentifié.'}, status=401)

    try:
        data = json.loads(request.body)
        target_id = data.get('target_id')
        if target_id is None:
            raise ValueError("ID cible manquant")
    except Exception:
        return JsonResponse({'success': False, 'error': 'Requête invalide.'}, status=400)

    from oauth_app.models import User42, Friendship

    try:
        sender = User42.objects.get(pk=user_id)
        receiver = User42.objects.get(user_id=target_id)
    except User42.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Utilisateur cible introuvable.'}, status=404)

    # On vérifie si une demande existe déjà
    if Friendship.objects.filter(sender=sender, receiver=receiver).exists():
        return JsonResponse({'success': False, 'error': 'Demande déjà envoyée.'}, status=400)

    Friendship.objects.create(sender=sender, receiver=receiver)
    return JsonResponse({'success': True, 'message': 'Demande d\'ami envoyée.'})

@csrf_exempt
def accept_friend_request_view(request):
    """
    Vue pour qu'un utilisateur accepte une demande d'amitié entrante.
    Nécessite un champ `sender_id` dans le body.
    """
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Méthode non autorisée.'}, status=405)

    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Utilisateur non authentifié.'}, status=401)

    try:
        data = json.loads(request.body)
        sender_id = data.get('sender_id')
        if sender_id is None:
            raise ValueError("ID de l'expéditeur manquant")
    except Exception:
        return JsonResponse({'success': False, 'error': 'Requête invalide.'}, status=400)

    from oauth_app.models import User42, Friendship

    try:
        receiver = User42.objects.get(pk=user_id)
        sender = User42.objects.get(user_id=sender_id)
    except User42.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Utilisateur introuvable.'}, status=404)

    try:
        # On cherche une demande d’amitié existante
        friendship = Friendship.objects.get(sender=sender, receiver=receiver)
    except Friendship.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Aucune demande à accepter.'}, status=404)

    # Mise à jour du statut pour marquer l’amitié comme acceptée
    friendship.is_accepted = True
    friendship.save()

    return JsonResponse({'success': True, 'message': 'Demande d\'ami acceptée.'})


from oauth_app.models import User42, Friendship

@csrf_exempt
def search_users_view(request):
    if request.method != 'GET':
        return JsonResponse({"success": False, "error": "Méthode non autorisée."}, status=405)

    user_id = request.session.get("user_id")
    if not user_id:
        return JsonResponse({"success": False, "error": "Utilisateur non authentifié."}, status=401)

    query = request.GET.get("q", "").strip()

    try:
        current_user = User42.objects.get(pk=user_id)
    except User42.DoesNotExist:
        return JsonResponse({"success": False, "error": "Utilisateur introuvable."}, status=404)

    # IDs des amis
    friends_ids = set(friend.user_id for friend in current_user.get_friends())

    # Requêtes en attente où le user est le destinataire
    incoming = Friendship.objects.filter(receiver=current_user, is_accepted=False).values_list('sender__user_id', flat=True)

    # Requêtes en attente envoyées par le user
    outgoing = Friendship.objects.filter(sender=current_user, is_accepted=False).values_list('receiver__user_id', flat=True)

    excluded_ids = friends_ids.union(incoming).union(outgoing).union({user_id})

    if query:
        results = User42.objects.filter(
            Q(username__icontains=query) | Q(first_name__icontains=query)
        ).exclude(user_id__in=excluded_ids)
    else:
        results = User42.objects.exclude(user_id__in=excluded_ids)

    data = [{
        "user_id": user.user_id,
        "username": user.username,
        "first_name": user.first_name,
        "avatar_url": user.profile_image.url if user.profile_image else "/media/profile_pictures/default_avatar.png"
    } for user in results]

    return JsonResponse({"success": True, "results": data}, status=200)

@csrf_exempt
def list_friends_view(request):
    """
    Renvoie la liste des amis de l'utilisateur connecté, avec leur statut de connexion.
    """
    if request.method != 'GET':
        return JsonResponse({"success": False, "error": "Méthode non autorisée."}, status=405)

    user_id = request.session.get("user_id")
    if not user_id:
        return JsonResponse({"success": False, "error": "Utilisateur non authentifié."}, status=401)

    try:
        user = User42.objects.get(pk=user_id)
    except User42.DoesNotExist:
        return JsonResponse({"success": False, "error": "Utilisateur introuvable."}, status=404)

    friends = user.get_friends()
    data = []

    for friend in friends:
        # On va chercher le dernier log de connexion du friend
        last_login = UserLoginHistory.objects.filter(user=friend).order_by('-timestamp').first()
        is_connected = last_login.is_connected if last_login else False

        data.append({
            "user_id": friend.user_id,
            "username": friend.username,
            "first_name": friend.first_name,
            "avatar_url": friend.profile_image.url if friend.profile_image else "/media/profile_pictures/default_avatar.png",
            "is_connected": is_connected
        })

    return JsonResponse({"success": True, "friends": data}, status=200)

@csrf_exempt
def list_incoming_requests_view(request):
    """
    Renvoie les demandes d'amis entrantes en attente.
    """
    if request.method != 'GET':
        return JsonResponse({"success": False, "error": "Méthode non autorisée."}, status=405)

    user_id = request.session.get("user_id")
    if not user_id:
        return JsonResponse({"success": False, "error": "Utilisateur non authentifié."}, status=401)

    try:
        user = User42.objects.get(pk=user_id)
    except User42.DoesNotExist:
        return JsonResponse({"success": False, "error": "Utilisateur introuvable."}, status=404)

    incoming = Friendship.objects.filter(receiver=user, is_accepted=False)
    data = [{
        "user_id": f.sender.user_id,
        "username": f.sender.username,
        "first_name": f.sender.first_name,
        "avatar_url": f.sender.profile_image.url if f.sender.profile_image else "/media/profile_pictures/default_avatar.png"
    } for f in incoming]

    return JsonResponse({"success": True, "requests": data}, status=200)
