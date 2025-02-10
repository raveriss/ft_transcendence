import os
import requests
import jwt
import datetime
import requests

from django.shortcuts import redirect, render
from django.http import JsonResponse, HttpResponseRedirect
from django.urls import reverse
from django.utils.crypto import get_random_string
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import check_password, make_password
from django.db import IntegrityError, transaction

from django.middleware.csrf import get_token
from django.contrib import messages

from .models import User42
from .utils import generate_jwt

# Ajout de la gestion des logs
import logging
logger = logging.getLogger(__name__)

# Récupération des variables d'env
CLIENT_ID = os.environ.get('OAUTH42_CLIENT_ID')
CLIENT_SECRET = os.environ.get('OAUTH42_CLIENT_SECRET')
REDIRECT_URI = os.environ.get('OAUTH42_REDIRECT_URI')
TOKEN_URL = "https://api.intra.42.fr/oauth/token"
AUTHORIZE_URL = "https://api.intra.42.fr/oauth/authorize"

def redirect_to_42(request):
    """
    Redirige vers la page d'authentification 42 en utilisant
    Authorization Code Grant. On génère un state random pour la protection CSRF.
    """
    state = get_random_string(32)
    request.session['oauth_state'] = state

    params = {
        'client_id': CLIENT_ID,
        'redirect_uri': REDIRECT_URI,
        'response_type': 'code',
        'scope': 'public',
        'state': state,
    }
    # Construction de l'URL d'authentification
    query_string = "&".join([f"{k}={v}" for k, v in params.items()])
    auth_url = f"{AUTHORIZE_URL}?{query_string}"
    return redirect(auth_url)


def callback_42(request):
    """
    Gère le callback après authentification 42.
    Échange le code reçu contre un token, puis récupère les infos utilisateur.
    """
    # Vérification du state
    state_session = request.session.get('oauth_state')
    state_request = request.GET.get('state')
    if not state_session or state_session != state_request:
        return JsonResponse({"error": "Invalid state"}, status=400)

    code = request.GET.get('code')
    if not code:
        return JsonResponse({"error": "No code provided"}, status=400)

    # Échange code -> access token
    data = {
        'grant_type': 'authorization_code',
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'code': code,
        'redirect_uri': REDIRECT_URI,
    }
    try:
        response = requests.post(TOKEN_URL, data=data)
        token_data = response.json()
        access_token = token_data.get('access_token')
        if not access_token:
            return JsonResponse({"error": "Failed to retrieve access token"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

    # Récupération des infos utilisateur depuis l'API 42
    user_info_url = "https://api.intra.42.fr/v2/me"
    headers = {
        'Authorization': f"Bearer {access_token}"
    }
    user_resp = requests.get(user_info_url, headers=headers)
    if user_resp.status_code != 200:
        return JsonResponse({"error": "Failed to retrieve user info"}, status=400)

    user_data = user_resp.json()
    user_id_42 = user_data['id']
    user_name_42 = user_data['login']

    # Récupération de l'email et du prénom depuis l'API 42
    email_from_api = user_data.get('email')
    first_name_from_api = user_data.get('first_name')

    # Pour un nouvel utilisateur, si l'API ne fournit pas ces informations,
    # on utilise les valeurs par défaut.
    email_value = email_from_api if email_from_api else 'placeholder@example.com'
    first_name_value = first_name_from_api if first_name_from_api else 'Unknown'

    # Utilisation de get_or_create pour éviter les doublons.
    # Pour un nouvel utilisateur, les champs username, email_address et first_name
    # seront initialisés grâce à defaults.
    try:
        with transaction.atomic():
            # Recherche de l'utilisateur par email (champ unique dans notre cas)
            user = User42.objects.filter(email_address=email_value).first()
            if user:
                # L'utilisateur existe déjà : on met à jour les infos si l'API fournit de nouvelles données
                if (email_from_api and email_from_api != user.email_address) or \
                   (first_name_from_api and first_name_from_api != user.first_name):
                    user.email_address = email_from_api or user.email_address
                    user.first_name = first_name_from_api or user.first_name
                    user.save()
            else:
                # L'utilisateur n'existe pas encore : on lui attribue un user_id unique
                existing_ids = list(User42.objects.values_list('user_id', flat=True))
                sorted_ids = sorted(existing_ids)
                new_user_id = 0
                for uid in sorted_ids:
                    if uid == new_user_id:
                        new_user_id += 1
                    else:
                        # Dès qu'on détecte un gap, new_user_id est disponible
                        break

                user = User42(
                    user_id=new_user_id,
                    username=user_name_42,
                    email_address=email_value,
                    first_name=first_name_value,
                )
                user.save()
    except IntegrityError:
        return JsonResponse({"error": "Erreur lors de l'inscription de l'utilisateur"}, status=400)


    # --- Ajout de la mise à jour de la session ---
    request.session['user_id'] = user.pk
    request.session['email'] = user.email_address
    # -----------------------------------------------

    # Générer un JWT pour la session
    jwt_token = generate_jwt(user_id=user_id_42, username=user_name_42)

    # Redirection côté frontend, transmettant le token ou un paramètre signifiant succès
    # On peut stocker le token dans un cookie HttpOnly (plus sûr), ou dans un paramètre GET
    response = HttpResponseRedirect(f"https://localhost:8443/game_interface.html?jwt={jwt_token}")
    return response

# --- Vue d'inscription modifiée pour gérer l'upload de l'image de profil ---
@csrf_exempt
def signup_view(request):
    if request.method == 'POST':
        # Récupération des données du formulaire
        first_name   = request.POST.get('firstname')
        email        = request.POST.get('email')
        raw_password = request.POST.get('password')
        pseudo       = request.POST.get('pseudo', '')

        # Vérification que tous les champs requis sont présents
        if not all([first_name, email, raw_password]):
            return JsonResponse(
                {"success": False, "error": "Tous les champs requis ne sont pas remplis."},
                status=400
            )

        # Gestion de l'image de profil
        profile_image = request.FILES.get('avatar')
        if profile_image:
            # Limiter la taille du fichier à 2MB
            if profile_image.size > 2 * 1024 * 1024:
                return JsonResponse(
                    {"success": False, "error": "La taille de l'image ne doit pas dépasser 2MB."},
                    status=400
                )
            # Vérifier le type MIME (seuls JPEG et PNG sont acceptés)
            if profile_image.content_type not in ['image/jpeg', 'image/png']:
                return JsonResponse(
                    {"success": False, "error": "Format d'image non supporté. Seul JPEG et PNG sont autorisés."},
                    status=400
                )

        try:
            with transaction.atomic():
                # Récupérer tous les user_id existants
                existing_ids = list(User42.objects.values_list('user_id', flat=True))
                # Trier les IDs pour faciliter la recherche de la plus petite valeur manquante
                sorted_ids = sorted(existing_ids)

                # Déterminer le plus petit user_id disponible
                new_user_id = 0
                for uid in sorted_ids:
                    if uid == new_user_id:
                        new_user_id += 1
                    else:
                        # Dès qu'on trouve un gap, on arrête : new_user_id est disponible
                        break

                # Création de l'utilisateur avec le user_id trouvé
                user = User42(
                    user_id=new_user_id,
                    username=pseudo or email.split('@')[0],
                    first_name=first_name,
                    email_address=email,
                )
                user.password = make_password(raw_password)
                if profile_image:
                    user.profile_image = profile_image
                user.save()

        except IntegrityError:
            # Gestion propre des erreurs transactionnelles pour éviter les conflits d'unicité
            return JsonResponse(
                {"success": False, "error": "Cette adresse e-mail est déjà utilisée."},
                status=400
            )

        return JsonResponse(
            {"success": True, "detail": "Inscription réussie."},
            status=201
        )

    return JsonResponse(
        {"success": False, "error": "Méthode non autorisée."},
        status=405
    )

@csrf_exempt
def login_view(request):
    """
    Vue permettant à l'utilisateur de se connecter avec email + password.
    Retourne un JSON indiquant le succès ou l'échec,
    ainsi qu'une éventuelle URL de redirection.
    """
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')

        if not email or not password:
            return JsonResponse({
                "success": False,
                "error": "Champs 'email' et 'password' requis."
            }, status=400)

        # On tente de récupérer l'utilisateur via l’email
        user = User42.objects.filter(email_address=email).first()
        if not user:
            return JsonResponse({
                "success": False,
                "error": "Email ou mot de passe incorrect."
            }, status=401)

        # Vérification du mot de passe
    if check_password(password, user.password):
        # Authentification réussie : stocker l'ID dans la session
        request.session['user_id'] = user.pk
        request.session['email'] = user.email_address
        
        # Vérifier si la 2FA n'est pas activée
        if not user.is_2fa_enabled:
            return JsonResponse({
                "success": True,
                "redirect": "/auth/2fa/setup/"
            }, status=200)
        else:
            return JsonResponse({
                "success": True,
                "redirect": "/game_interface.html"
            }, status=200)

    # Méthode non autorisée
    return JsonResponse({
        "success": False,
        "error": "Méthode non autorisée."
    }, status=405)

# -------------------------------
# Nouvelle vue pour récupérer le username
# -------------------------------
def user_info(request):
    logger.debug("Appel de user_info, session: %s", dict(request.session))
    user_id = request.session.get('user_id')
    if not user_id:
        logger.error("Aucun user_id dans la session !")
        return JsonResponse({'error': 'User not authenticated'}, status=401)
    try:
        user = User42.objects.get(pk=user_id)
        logger.debug("Utilisateur trouvé : %s", user.username)
        return JsonResponse({'username': user.username, 'profile_image': user.profile_image.url})
    except User42.DoesNotExist:
        logger.error("Utilisateur non trouvé pour user_id=%s", user_id)
        return JsonResponse({'error': 'User not found'}, status=404)
    
@csrf_exempt
def upload_avatar_view(request):
    if request.method == 'POST':
        # Vérification de l'authentification via la session
        user_id = request.session.get('user_id')
        if not user_id:
            return JsonResponse({"success": False, "error": "Utilisateur non authentifié."}, status=401)
        try:
            user = User42.objects.get(pk=user_id)
        except User42.DoesNotExist:
            return JsonResponse({"success": False, "error": "Utilisateur non trouvé."}, status=404)

        # Récupération du fichier envoyé
        avatar_file = request.FILES.get('avatar')
        if not avatar_file:
            return JsonResponse({"success": False, "error": "Aucun fichier envoyé."}, status=400)

        # Vérification de la taille (max 2MB)
        if avatar_file.size > 2 * 1024 * 1024:
            return JsonResponse({"success": False, "error": "La taille de l'image ne doit pas dépasser 2MB."}, status=400)
        # Vérification du format (JPEG/PNG)
        if avatar_file.content_type not in ['image/jpeg', 'image/png']:
            return JsonResponse({"success": False, "error": "Format d'image non supporté."}, status=400)

        # Sauvegarde du nouvel avatar dans le modèle (le champ profile_image gère le chemin d'upload)
        user.profile_image = avatar_file
        user.save()

        # Retour de l'URL de la nouvelle image pour mise à jour immédiate côté client
        return JsonResponse({"success": True, "profile_image_url": user.profile_image.url}, status=200)
    else:
        return JsonResponse({"success": False, "error": "Méthode non autorisée."}, status=405)