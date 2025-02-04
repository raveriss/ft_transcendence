# backend/oauth_app/twofa_views.py
import io
import base64
import pyotp
import qrcode
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import User42

# Optionnel : Limitation des tentatives brute force
MAX_2FA_ATTEMPTS = 5

def get_current_user(request):
    """Récupère l'utilisateur connecté via la session."""
    user_id = request.session.get('user_id')
    if not user_id:
        return None
    try:
        return User42.objects.get(pk=user_id)
    except User42.DoesNotExist:
        return None

def generate_qr_code_image(uri):
    """Génère un QR Code et retourne l'image encodée en base64."""
    qr = qrcode.make(uri)
    buffered = io.BytesIO()
    qr.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return img_str

def two_factor_setup(request):
    """
    Affiche le QR Code pour configurer l'authentification 2FA.
    Si le secret TOTP n'existe pas encore pour l'utilisateur, il est créé.
    """
    user = get_current_user(request)
    if not user:
        return redirect('/auth/login/')
    
    # Si le 2FA est déjà activé, rediriger directement vers l'interface de jeu
    if user.is_2fa_enabled:
        return redirect('/game_interface.html')
    
    # Générer le secret TOTP s'il n'existe pas déjà
    if not user.totp_secret:
        user.totp_secret = pyotp.random_base32()
        user.save()
    
    # Création de l'URI de provisioning pour Google Authenticator
    otp = pyotp.TOTP(user.totp_secret)
    provisioning_uri = otp.provisioning_uri(name=user.email_address, issuer_name="ConecteMe")
    
    # Génération du QR Code encodé en base64
    qr_code_base64 = generate_qr_code_image(provisioning_uri)
    
    return render(request, "2fa_setup.html", {"qr_code": qr_code_base64})

@csrf_exempt
def two_factor_validate(request):
    """
    Valide le code TOTP envoyé par l'utilisateur.
    En cas de succès, active le 2FA et renvoie une réponse JSON avec redirection.
    """
    user = get_current_user(request)
    if not user:
        return JsonResponse({"success": False, "error": "Utilisateur non authentifié."}, status=401)
    
    if request.method == 'POST':
        otp_code = request.POST.get('otp_code')
        if not otp_code:
            return JsonResponse({"success": False, "error": "Le code OTP est requis."}, status=400)
        
        # Limiter le nombre de tentatives pour contrer le bruteforce
        attempts = request.session.get('2fa_attempts', 0)
        if attempts >= MAX_2FA_ATTEMPTS:
            return JsonResponse({"success": False, "error": "Nombre maximum de tentatives atteint."}, status=429)
        
        totp = pyotp.TOTP(user.totp_secret)
        if totp.verify(otp_code, valid_window=1):  # valid_window permet un léger décalage
            user.is_2fa_enabled = True
            user.save()
            request.session['2fa_attempts'] = 0  # Réinitialisation du compteur de tentatives
            return JsonResponse({
                "success": True,
                "message": "2FA validé avec succès.",
                "redirect": "/game_interface.html"
            }, status=200)
        else:
            request.session['2fa_attempts'] = attempts + 1
            return JsonResponse({"success": False, "error": "Code OTP invalide."}, status=400)
    else:
        return JsonResponse({"success": False, "error": "Méthode non autorisée."}, status=405)
