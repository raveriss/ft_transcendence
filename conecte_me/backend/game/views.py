# game/views.py
import json
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from oauth_app.jwt_decorator import jwt_required
from .models import GameSettings

@require_http_methods(["GET", "POST"])
@jwt_required  # On protège cette vue par un token JWT
def game_settings_api(request):
    """
    Cette vue permet de récupérer ou mettre à jour les réglages du jeu 
    pour l'utilisateur identifié par son token JWT.
    """
    # L'utilisateur authentifié par le décorateur est stocké dans request.user
    user = getattr(request, 'user', None)
    if not user:
        return JsonResponse({"detail": "No user in request."}, status=401)

    # Récupérer ou créer des réglages pour ce user
    try:
        settings_obj = user.game_settings
    except GameSettings.DoesNotExist:
        settings_obj = GameSettings.objects.create(user=user)

    if request.method == "GET":
        data = {
            "time": settings_obj.time,
            "score_limit": settings_obj.score_limit,
            "lives": settings_obj.lives,
            "ball_speed": settings_obj.ball_speed,
            # On renvoie le username depuis l'utilisateur (pas stocké dans GameSettings)
            "username": user.username
        }
        return JsonResponse(data, status=200)
    else:  # POST => mise à jour des champs
        try:
            payload = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"success": False, "error": "Invalid JSON"}, status=400)

        settings_obj.time = payload.get("time", settings_obj.time)
        settings_obj.score_limit = payload.get("score_limit", settings_obj.score_limit)
        settings_obj.lives = payload.get("lives", settings_obj.lives)
        settings_obj.ball_speed = payload.get("ball_speed", settings_obj.ball_speed)
        settings_obj.save()
        return JsonResponse({"success": True}, status=200)
