import os
import requests
import jwt
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
    response = HttpResponseRedirect(f"https://localhost:8443/game_interface.html?jwt={jwt_token}")
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