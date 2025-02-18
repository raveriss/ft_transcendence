import os
import requests
import jwt
import datetime
import requests
import json
import re


from django.shortcuts import redirect, render
from django.http import JsonResponse, HttpResponseRedirect
from django.urls import reverse
from django.utils.crypto import get_random_string
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import check_password, make_password
from django.db import IntegrityError, transaction
from .models import User42, UserLoginHistory


from django.middleware.csrf import get_token
from django.contrib import messages

from .models import User42, UserLoginHistory
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
    Échange le code reçu contre un token, récupère les infos utilisateur et,
    si un mot de passe temporaire a été défini via signin42, l'utilise pour mettre à jour le compte.
    """
    # Vérification du state
    state_session = request.session.get('oauth_state')
    state_request = request.GET.get('state')
    if not state_session or state_session != state_request:
        return JsonResponse({"error": "Invalid state"}, status=400)

    code = request.GET.get('code')
    if not code:
        return JsonResponse({"error": "No code provided"}, status=400)

    # Échange du code contre un access token
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

    # Si l'API ne fournit pas ces informations, on utilise des valeurs par défaut.
    email_value = email_from_api if email_from_api else 'placeholder@example.com'
    first_name_value = first_name_from_api if first_name_from_api else 'Unknown'

    try:
        with transaction.atomic():
            # Récupération éventuelle d'un mot de passe temporaire défini via signin42
            temp_password = request.session.get('temp_hashed_password')

            # Recherche de l'utilisateur par email (champ unique dans notre cas)
            user = User42.objects.filter(email_address=email_value).first()
            if user:
                # L'utilisateur existe déjà : on met à jour ses infos si nécessaire
                if (email_from_api and email_from_api != user.email_address) or \
                   (first_name_from_api and first_name_from_api != user.first_name):
                    user.email_address = email_from_api or user.email_address
                    user.first_name = first_name_from_api or user.first_name
                # Si un mot de passe temporaire est présent, on l'utilise pour mettre à jour le mot de passe
                if temp_password:
                    user.password = temp_password
                    del request.session['temp_hashed_password']
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
                        break

                user = User42(
                    user_id=new_user_id,
                    username=user_name_42,
                    email_address=email_value,
                    first_name=first_name_value,
                )
                # Si un mot de passe temporaire a été défini, on l'utilise dès la création
                if temp_password:
                    user.password = temp_password
                    del request.session['temp_hashed_password']
                user.save()
    except IntegrityError:
        return JsonResponse({"error": "Erreur lors de l'inscription de l'utilisateur"}, status=400)

    # Mise à jour de la session
    request.session['user_id'] = user.pk
    request.session['email'] = user.email_address

    # --- Enregistrement du log de connexion pour le login via 42 ---
    ip_address = request.META.get('REMOTE_ADDR')
    user_agent = request.META.get('HTTP_USER_AGENT', '')
    UserLoginHistory.objects.create(
        user=user,
        ip_address=ip_address,
        user_agent=user_agent
    )

    # Génération d'un JWT pour la session
    jwt_token = generate_jwt(user_id=user_id_42, username=user_name_42)

    # Redirection côté frontend vers l'interface de jeu, en transmettant le token
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

def user_login_history(request):
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'error': 'User not authenticated'}, status=401)
    try:
        user = User42.objects.get(pk=user_id)
    except User42.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

    # Récupérer les 3 dernières connexions (déjà ordonnées par -timestamp grâce à Meta)
    logs = UserLoginHistory.objects.filter(user=user)[:3]
    data = [
        {
            'timestamp': log.timestamp.isoformat(),
            'ip_address': log.ip_address,
            'user_agent': log.user_agent,
        }
        for log in logs
    ]
    return JsonResponse({'login_history': data})

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')

        if not email or not password:
            return JsonResponse({
                "success": False,
                "error": "Champs 'email' et 'password' requis."
            }, status=400)

        user = User42.objects.filter(email_address=email).first()
        if not user:
            return JsonResponse({
                "success": False,
                "error": "Email ou mot de passe incorrect."
            }, status=401)

        if check_password(password, user.password):
            # Authentification réussie : mise à jour de la session
            request.session['user_id'] = user.pk
            request.session['email'] = user.email_address

            # Si 2FA n'est pas encore activé, rediriger vers la configuration 2FA
            if not user.is_2fa_enabled:
                return JsonResponse({
                    "success": True,
                    "redirect": "/auth/2fa/setup/"
                }, status=200)
            else:
                # Si la 2FA est déjà activée, enregistrer la connexion
                ip_address = request.META.get('REMOTE_ADDR')
                user_agent = request.META.get('HTTP_USER_AGENT', '')
                UserLoginHistory.objects.create(
                    user=user,
                    ip_address=ip_address,
                    user_agent=user_agent
                )
                return JsonResponse({
                    "success": True,
                    "redirect": "/game_interface.html"
                }, status=200)

        return JsonResponse({
            "success": False,
            "error": "Email ou mot de passe incorrect."
        }, status=401)
    
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
    
@csrf_exempt
def set_42_password_view(request):
    """
    Réception du mot de passe saisi par l’utilisateur lors de sa première connexion via 42.
    Le mot de passe est validé, haché et stocké temporairement dans la session.
    """
    if request.method == 'POST':
        password = request.POST.get('password')
        confirm = request.POST.get('confirmPassword')

        if not password or not confirm or password != confirm:
            return JsonResponse({"success": False, "error": "Les mots de passe ne correspondent pas."}, status=400)

        # Vérification côté serveur : minimum 8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial
        pattern = r'^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$'
        if not re.match(pattern, password):
            return JsonResponse({"success": False, "error": "Le mot de passe ne respecte pas les critères de sécurité."}, status=400)

        # Hachage sécurisé du mot de passe
        hashed_password = make_password(password)
        # Stockage temporaire dans la session
        request.session['temp_hashed_password'] = hashed_password

        return JsonResponse({
            "success": True,
            "detail": "Mot de passe défini avec succès. Vous allez être redirigé vers l'authentification 42."
        }, status=200)
    else:
        return JsonResponse({"success": False, "error": "Méthode non autorisée."}, status=405)
    
@csrf_exempt
def update_email_view(request):
    if request.method != 'POST':
        return JsonResponse({"success": False, "error": "Méthode non autorisée."}, status=405)
    
    # Vérifier que l'utilisateur est authentifié via la session
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({"success": False, "error": "Utilisateur non authentifié."}, status=401)
    
    try:
        user = User42.objects.get(pk=user_id)
    except User42.DoesNotExist:
        return JsonResponse({"success": False, "error": "Utilisateur non trouvé."}, status=404)
    
    # Extraire le JSON envoyé
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