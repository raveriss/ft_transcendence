# game/views.py
import json
from django.http import JsonResponse
from django.db.models import Q, F, Count, Avg
from django.utils import timezone
from django.views.decorators.http import require_http_methods
from oauth_app.jwt_decorator import jwt_required
from django.views.decorators.csrf import csrf_exempt
from .models import GameSettings, MatchHistory

# Gère les réglages de chaque joueur
@csrf_exempt # Désactive CSRF car on utilise JWT
@require_http_methods(["GET", "POST"])
@jwt_required # Protection par token JWT
def game_settings_api(request):
    """
    Cette vue permet de récupérer ou mettre à jour les réglages du jeu 
    pour l'utilisateur identifié par son token JWT.
    """
    user = getattr(request, 'user', None)
    if not user:
        return JsonResponse({"detail": "No user in request."}, status=401)

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
            "map_choice": settings_obj.map_choice,
            "username": user.username,
            "user_id": user.user_id,
            "paddle_size": settings_obj.paddle_size,
            "particles_enabled": settings_obj.particles_enabled,
            "paddle_hit_sound_enabled": settings_obj.paddle_hit_sound_enabled,
        }
        return JsonResponse(data, status=200)
    else:
        try:
            payload = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"success": False, "error": "Invalid JSON"}, status=400)
        settings_obj.time = payload.get("time", settings_obj.time)
        settings_obj.score_limit = payload.get("score_limit", settings_obj.score_limit)
        settings_obj.lives = payload.get("lives", settings_obj.lives)
        settings_obj.ball_speed = payload.get("ball_speed", settings_obj.ball_speed)
        settings_obj.map_choice = payload.get("map_choice", settings_obj.map_choice)
        settings_obj.paddle_size = payload.get("paddle_size", settings_obj.paddle_size)
        settings_obj.particles_enabled = payload.get("particles_enabled", settings_obj.particles_enabled)
        settings_obj.paddle_hit_sound_enabled = payload.get("paddle_hit_sound_enabled", settings_obj.paddle_hit_sound_enabled)
        settings_obj.save()
        return JsonResponse({"success": True}, status=200)

# Enregistre les matchs dans l'historique
@csrf_exempt
@jwt_required
def match_history_api(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            # Utiliser directement l'utilisateur connecté pour player1
            player1_userid = request.user
            
            # Créer l'enregistrement du match dans l'historique
            match = MatchHistory.objects.create(
                player1=player1_userid,      # Enregistre le user_id via la relation ForeignKey
                player2=data.get('player2'),
                score1=data.get('score1'),
                score2=data.get('score2'),
                duration=data.get('duration'),
                recorded=data.get('recorded', True)
            )
            return JsonResponse({"success": True, "match_id": match.id}, status=201)
        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)}, status=400)
    else:
        return JsonResponse({"error": "Méthode non autorisée."}, status=405)

# Récupère les 3 derniers matchs du joueur connecté (player1)
@csrf_exempt
@jwt_required
def match_history_list(request):
    if request.method == "GET":
        user = getattr(request, 'user', None)
        if not user:
            return JsonResponse({"detail": "No user in request."}, status=401)
        # Filtrer les matchs où l'utilisateur connecté est player1
        matches = MatchHistory.objects.filter(player1=user).order_by('-match_date')[:3]
        matches_data = []
        for match in matches:
            matches_data.append({
                "match_date": match.match_date.isoformat(),
                "player1": match.player1.username if match.player1 else None,
                "player2": match.player2,
                "score1": match.score1,
                "score2": match.score2,
                "duration": match.duration,
                "recorded": match.recorded,
            })
        return JsonResponse(matches_data, safe=False, status=200)
    else:
        return JsonResponse({"error": "Method not allowed."}, status=405)

@csrf_exempt
@jwt_required
def match_history_all(request):
    if request.method == "GET":
        user = getattr(request, 'user', None)
        if not user:
            return JsonResponse({"detail": "No user in request."}, status=401)
        # Retourne tous les matchs où l'utilisateur est player1
        matches = MatchHistory.objects.filter(player1=user).order_by('-match_date')
        matches_data = []
        for match in matches:
            matches_data.append({
                "match_date": match.match_date.isoformat(),
                "player1": match.player1.username if match.player1 else None,
                "player2": match.player2,
                "score1": match.score1,
                "score2": match.score2,
                "duration": match.duration,
                "recorded": match.recorded,
            })
        return JsonResponse(matches_data, safe=False, status=200)
    else:
        return JsonResponse({"error": "Method not allowed."}, status=405)

# Affiche le classement dans le board
@csrf_exempt
@jwt_required
def leaderboard(request):
    if request.method == "GET":
        try:
            user = getattr(request, 'user', None)
            if not user:
                return JsonResponse({"error": "No user in request."}, status=401)

            from django.db.models import Count, F
            # Agréger les victoires pour chaque joueur (player1)
            all_players = (
                MatchHistory.objects
                # 1) On compte seulement les victoires
                .filter(score1__gt=F('score2'))
                # 2) On exclut les matchs où player1 est NULL
                .filter(player1__isnull=False)
                .values('player1__user_id', 'player1__username')
                .annotate(win_count=Count('id'))
                .order_by('-win_count')
            )
            all_players = list(all_players)
            print("All players:", all_players)  # Pour débogage

            current_username = user.username
            userIndex = None
            for i, entry in enumerate(all_players):
                if entry['player1__username'] == current_username:
                    userIndex = i
                    break

            leaderboard_result = []
            if userIndex is None:
                # L'utilisateur n'a aucune victoire : afficher les 2 premiers et l'utilisateur avec 0 victoire
                top2 = all_players[:2]
                for i, e in enumerate(top2):
                    leaderboard_result.append({
                        'player1': e['player1__username'],
                        'win_count': e['win_count'],
                        'rank': i + 1,
                    })
                leaderboard_result.append({
                    'player1': current_username,
                    'win_count': 0,
                    'rank': len(all_players) + 1,
                })
            else:
                userRank = userIndex + 1
                if userRank <= 2:
                    # Si l'utilisateur est dans le top 2, afficher les 3 premiers
                    top3 = all_players[:3]
                    for i, e in enumerate(top3):
                        leaderboard_result.append({
                            'player1': e['player1__username'],
                            'win_count': e['win_count'],
                            'rank': i + 1,
                        })
                else:
                    # Sinon, afficher les 2 premiers puis l'entrée de l'utilisateur
                    top2 = all_players[:2]
                    for i, e in enumerate(top2):
                        leaderboard_result.append({
                            'player1': e['player1__username'],
                            'win_count': e['win_count'],
                            'rank': i + 1,
                        })
                    leaderboard_result.append({
                        'player1': all_players[userIndex]['player1__username'],
                        'win_count': all_players[userIndex]['win_count'],
                        'rank': userRank,
                    })
            return JsonResponse(leaderboard_result, safe=False, status=200)
        except Exception as e:
            import traceback
            traceback.print_exc()  # Affiche la trace complète dans les logs du serveur
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Méthode non autorisée."}, status=405)

# stat leger dans vue user
@csrf_exempt
@jwt_required
def user_stats(request):
    if request.method == "GET":
        user = getattr(request, 'user', None)
        if not user:
            return JsonResponse({"error": "No user in request."}, status=401)

        # Calcul des parties totales (où l'utilisateur est player1)
        total_games = MatchHistory.objects.filter(player1=user).count()
        # Victoires : quand score1 > score2
        wins = MatchHistory.objects.filter(player1=user, score1__gt=F('score2')).count()
        losses = total_games - wins

        # Calcul du win streak (nombre de victoires consécutives en commençant par le match le plus récent)
        matches = list(MatchHistory.objects.filter(player1=user).order_by('-match_date'))
        win_streak = 0
        for match in matches:
            if match.score1 > match.score2:
                win_streak += 1
            else:
                break

        # Calcul de la durée moyenne des matchs (en secondes)
        avg_duration_dict = MatchHistory.objects.filter(player1=user).aggregate(avg_duration=Avg('duration'))
        avg_duration = avg_duration_dict['avg_duration'] if avg_duration_dict['avg_duration'] is not None else 0

        # Calcul du rank progress : nombre de victoires obtenues dans la dernière semaine
        one_week_ago = timezone.now() - timezone.timedelta(days=7)
        weekly_wins = MatchHistory.objects.filter(
            player1=user, 
            match_date__gte=one_week_ago, 
            score1__gt=F('score2')
        ).count()

        # Pour l'instant, l'Elo reste fixé à 0
        return JsonResponse({
            "elo": 0,
            "total_games": total_games,
            "wins": wins,
            "losses": losses,
            "win_streak": win_streak,
            "avg_duration": avg_duration,
            "rank_progress": weekly_wins,
        }, status=200)
    else:
        return JsonResponse({"error": "Méthode non autorisée."}, status=405)