# backend/oauth_app/twofa_views.py

# Importation du module io pour manipuler des flux de données en mémoire (utilisé pour la génération du QR Code).
import io

# Importation du module base64 pour encoder les images en base64 (pour intégrer le QR Code dans une page web).
import base64

# Importation de pyotp pour générer et vérifier les codes TOTP utilisés dans l'authentification à deux facteurs.
import pyotp

# Importation de qrcode pour générer des QR Codes à partir d'une URI (pour la configuration de la 2FA).
import qrcode

# Importation de render et redirect depuis django.shortcuts pour afficher des templates ou rediriger l'utilisateur.
from django.shortcuts import render, redirect

# Importation de JsonResponse depuis django.http pour renvoyer des réponses en format JSON.
from django.http import JsonResponse

# Importation du décorateur csrf_exempt pour désactiver la vérification CSRF sur certaines vues (utile pour les API ou tests).
from django.views.decorators.csrf import csrf_exempt

# Importation des modèles User42 et UserLoginHistory pour interagir avec les utilisateurs et enregistrer l'historique de connexion.
from .models import User42, UserLoginHistory

# Définition d'une constante limitant le nombre maximal de tentatives de validation 2FA pour contrer les attaques par force brute.
MAX_2FA_ATTEMPTS = 5

# Fonction utilitaire pour récupérer l'utilisateur connecté en se basant sur l'identifiant stocké dans la session.
def get_current_user(request):

    # Extraction de l'identifiant de l'utilisateur depuis la session.
    user_id = request.session.get('user_id')

    # Si aucun identifiant n'est trouvé, retourner None pour indiquer qu'aucun utilisateur n'est connecté.
    if not user_id:
        return None
    try:

        # Récupération de l'utilisateur dans la base de données grâce à son identifiant.
        return User42.objects.get(pk=user_id)
    except User42.DoesNotExist:

        # Si l'utilisateur n'existe pas, retourner None.
        return None

# Fonction pour générer un QR Code à partir d'une URI et renvoyer l'image encodée en base64.
def generate_qr_code_image(uri):

    # Création du QR Code à partir de l'URI fournie.
    qr = qrcode.make(uri)

    # Création d'un flux en mémoire pour sauvegarder l'image.
    buffered = io.BytesIO()

    # Sauvegarde de l'image QR dans le flux au format PNG.
    qr.save(buffered, format="PNG")

    # Encodage du contenu du flux en base64 et conversion en chaîne de caractères UTF-8.
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")

    # Retourne la chaîne encodée qui représente l'image du QR Code.
    return img_str

# Vue permettant d'afficher le QR Code pour configurer l'authentification à deux facteurs (2FA).
def two_factor_setup(request):
    """
    Affiche le QR Code pour configurer l'authentification 2FA.
    Si le secret TOTP n'existe pas encore pour l'utilisateur, il est créé.
    """

    # Récupération de l'utilisateur connecté via la fonction utilitaire.
    user = get_current_user(request)

    # Si aucun utilisateur n'est connecté, rediriger vers la page de connexion.
    if not user:
        return redirect('/auth/login/')
    
    # Si l'utilisateur n'a pas encore de secret TOTP, en générer un.
    if not user.totp_secret:

        # Génération d'un secret aléatoire en base32 pour TOTP.
        user.totp_secret = pyotp.random_base32()

        # Sauvegarde du secret dans la base de données.
        user.save()
    
    # Création d'un objet TOTP basé sur le secret de l'utilisateur.
    otp = pyotp.TOTP(user.totp_secret)

    # Création de l'URI de provisioning pour configurer Google Authenticator,
    # en associant l'email de l'utilisateur et un nom d'émetteur (issuer).
    provisioning_uri = otp.provisioning_uri(name=user.email_address, issuer_name="ConecteMe")
    
    # Génération du QR Code encodé en base64 à partir de l'URI de provisioning.
    qr_code_base64 = generate_qr_code_image(provisioning_uri)
    
    # Rendu du template "2fa_setup.html" en passant le QR Code dans le contexte pour affichage.
    return render(request, "2fa_setup.html", {"qr_code": qr_code_base64})

# Application du décorateur csrf_exempt pour désactiver la vérification CSRF sur cette vue,
# ce qui facilite notamment les requêtes POST provenant de clients qui ne gèrent pas CSRF.
@csrf_exempt
def two_factor_validate(request):
    """
    Valide le code TOTP envoyé par l'utilisateur.
    En cas de succès, active le 2FA, enregistre la connexion et renvoie une réponse JSON avec redirection.
    """

    # Récupération de l'utilisateur connecté.
    user = get_current_user(request)

    # Si aucun utilisateur n'est connecté, retourner une réponse JSON d'erreur avec le statut 401 (non autorisé).
    if not user:
        return JsonResponse({"success": False, "error": "Utilisateur non authentifié."}, status=401)
    
    # Vérifier que la requête est une méthode POST.
    if request.method == 'POST':

        # Extraction du code OTP envoyé dans les données POST.
        otp_code = request.POST.get('otp_code')

        # Si le code OTP n'est pas fourni, retourner une réponse JSON avec le statut 400 (mauvaise requête).
        if not otp_code:
            return JsonResponse({"success": False, "error": "Le code OTP est requis."}, status=400)
        
        # Récupération du nombre de tentatives de validation 2FA stockées dans la session, par défaut à 0.
        attempts = request.session.get('2fa_attempts', 0)

        # Si le nombre de tentatives dépasse la limite définie, retourner une réponse JSON avec le statut 429 (trop de requêtes).
        if attempts >= MAX_2FA_ATTEMPTS:
            return JsonResponse({"success": False, "error": "Nombre maximum de tentatives atteint."}, status=429)
        
        # Création d'un objet TOTP pour vérifier le code OTP fourni.
        totp = pyotp.TOTP(user.totp_secret)

        # Vérification du code OTP en autorisant une légère marge d'erreur (valid_window=1).
        if totp.verify(otp_code, valid_window=1):

            # Si le code est validé, activer l'authentification 2FA pour l'utilisateur.
            user.is_2fa_enabled = True

            # Sauvegarder la mise à jour de l'utilisateur dans la base de données.
            user.save()

            # Réinitialiser le compteur de tentatives dans la session après validation réussie.
            request.session['2fa_attempts'] = 0  # Réinitialisation du compteur de tentatives
            
            # --- Enregistrement de la connexion 2FA ---
            # Récupération de l'adresse IP de l'utilisateur depuis les métadonnées de la requête.
            ip_address = request.META.get('REMOTE_ADDR')

            # Récupération du user agent (informations sur le navigateur ou client) depuis les métadonnées.
            user_agent = request.META.get('HTTP_USER_AGENT', '')

            # Création d'une entrée dans l'historique des connexions pour enregistrer la connexion réussie.
            UserLoginHistory.objects.create(
                user=user,
                ip_address=ip_address,
                user_agent=user_agent,
                is_connected=True
            )
            
            # Retourner une réponse JSON indiquant le succès de la validation 2FA,
            # avec un message de confirmation et l'URL de redirection vers l'interface de jeu.
            return JsonResponse({
                "success": True,
                "message": "2FA validé avec succès.",
                "redirect": "/board"
            }, status=200)
        else:

            # Si le code OTP est invalide, incrémenter le compteur de tentatives dans la session.
            request.session['2fa_attempts'] = attempts + 1

            # Retourner une réponse JSON indiquant l'échec de la validation avec le statut 400.
            return JsonResponse({"success": False, "error": "Code OTP invalide."}, status=400)
    else:

        # Si la méthode HTTP n'est pas POST, retourner une réponse JSON indiquant que la méthode n'est pas autorisée (405).
        return JsonResponse({"success": False, "error": "Méthode non autorisée."}, status=405)
