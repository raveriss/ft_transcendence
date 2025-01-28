import os
import requests
import jwt
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_protect
from django.contrib.auth import login
from django.db.models import Q
from django.contrib.auth.hashers import check_password

from .models import User42
from .utils import generate_jwt  # si vous voulez aussi fournir un token en plus
from django.shortcuts import redirect, render
from django.http import JsonResponse, HttpResponseRedirect
from django.urls import reverse
from django.utils.crypto import get_random_string
from .utils import generate_jwt

from django.contrib import messages

from django.db import IntegrityError, transaction

from django.views.decorators.csrf import csrf_exempt
from django.middleware.csrf import get_token
from django.contrib.auth.hashers import check_password
from .models import User42
from django.contrib.auth.hashers import make_password
from django.views.decorators.csrf import csrf_protect



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

    # Stocker ou mettre à jour l'utilisateur en base
    user, _ = User42.objects.get_or_create(
        user_id=user_id_42,
        defaults={'username': user_name_42}
    )

    # Générer un JWT pour la session
    jwt_token = generate_jwt(user_id=user_id_42, username=user_name_42)

    # Redirection côté frontend, transmettant le token ou un paramètre signifiant succès
    # On peut stocker le token dans un cookie HttpOnly (plus sûr), ou dans un paramètre GET
    response = HttpResponseRedirect(f"https://localhost:8443/?jwt={jwt_token}")
    return response

@csrf_exempt
def signup_view(request):
    if request.method == 'POST':
        # Récupération des données depuis la requête POST
        first_name = request.POST.get('firstname')
        email = request.POST.get('email')
        raw_password = request.POST.get('password')
        pseudo = request.POST.get('pseudo', '')

        # Validation des champs
        if not all([first_name, email, raw_password]):
            return JsonResponse({"success": False, "error": "Tous les champs requis ne sont pas remplis."}, status=400)
        try:
            with transaction.atomic():
                user = User42(
                    user_id=0,  # Placeholder pour le moment
                    username=pseudo or email.split('@')[0],
                    first_name=first_name,
                    email_address=email,
                )
                user.password = make_password(raw_password)  # Hash du mot de passe
                user.save()
        except IntegrityError:
            return JsonResponse({"success": False, "error": "Cette adresse e-mail est déjà utilisée."}, status=400)

        # Succès de l'inscription
        return JsonResponse({"success": True, "detail": "Inscription réussie."}, status=201)

    # Méthode non autorisée
    return JsonResponse({"success": False, "error": "Méthode non autorisée."}, status=405)

@csrf_protect
def login_view(request):
    """
    Vue permettant de se connecter avec un pseudo OU un email
    + mot de passe, et de gérer la session utilisateur.
    """
    if request.method != 'POST':
        return JsonResponse({"success": False, "message": "Méthode non autorisée"}, status=405)

    try:
        body = json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError:
        return JsonResponse({"success": False, "message": "Données JSON invalides"}, status=400)

    identifier = body.get('identifier')  # pseudo ou email
    password = body.get('password')

    if not identifier or not password:
        return JsonResponse({"success": False, "message": "Identifiants manquants"}, status=400)

    # On cherche dans la table par username OU email_address
    user = User42.objects.filter(Q(username=identifier) | Q(email_address=identifier)).first()
    if not user:
        # Pour éviter de dire “email non trouvé” ou “pseudo non trouvé”, on masque volontairement
        return JsonResponse({"success": False, "message": "Identifiants invalides"}, status=401)

    # Vérification du mot de passe
    if not check_password(password, user.password):
        return JsonResponse({"success": False, "message": "Identifiants invalides"}, status=401)

    # Si vous gérez un champ “is_active”, vérifiez ici :
    # if not user.is_active:
    #    return JsonResponse({"success": False, "message": "Compte inactif"}, status=403)

    # Authentification via session
    # (nécessite un objet “User” conforme à Django — si vous utilisez
    #  un model custom, vous pourriez devoir créer un user “virtuel”
    #  ou migrer vers un custom user model complet)
    # Pour simplifier, on va “outrepasser” et forcer la session manuellement :
    request.session['user42_id'] = user.id

    # OU, si votre User42 hérite de AbstractBaseUser ou extends Django user
    # vous pouvez faire : login(request, user)

    # Génération optionnelle d’un token JWT pour usage en front
    token = generate_jwt(user_id=user.user_id, username=user.username)

    # Retourne un JSON de succès
    return JsonResponse({
        "success": True,
        "message": "Authentification réussie",
        "token": token
    }, status=200)