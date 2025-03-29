from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.views.decorators.http import require_GET
from .models import Tournament, Player, Match
import random, json

@csrf_exempt
def create_tournament(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            name = data.get("name")
            num_players = int(data.get("num_players"))
            player_nicknames = data.get("player_nicknames", [])
            
            if num_players % 2 != 0:
                return JsonResponse({"error": "Le nombre de joueurs doit être pair."}, status=400)

            if not name or not player_nicknames:
                return JsonResponse({"error": "Le nom du tournoi et les pseudos des joueurs sont requis."}, status=400)

            if len(player_nicknames) != num_players:
                return JsonResponse({"error": "Le nombre de pseudos ne correspond pas au nombre de joueurs."}, status=400)

            score_limit = data.get("game_settings", {}).get("score_limit", 5)
            time = data.get("game_settings", {}).get("time", 120)

            tournament = Tournament.objects.create(
                name=name,
                num_players=num_players,
                score_limit=score_limit,
                time=time
            )

            request.session["current_tournament_id"] = tournament.id

            players = [Player.objects.create(tournament=tournament, nickname=nick) for nick in player_nicknames]

            random.shuffle(players)

            first_round_matches = create_matches(tournament, players, round_number=1)

            return JsonResponse({
			    "tournament": {
			        "id": tournament.id,
			        "name": tournament.name,
			        "time": tournament.time,
			        "score_limit": tournament.score_limit
			    },
			    "players": [p.nickname for p in players],
			    "matches": [
			        {
			            "id": m.id,
			            "player1": m.player1.nickname,
			            "player2": m.player2.nickname,
			            "round": m.round_number,
			            "winner": m.winner.nickname if m.winner else None
			        } for m in first_round_matches
			    ]
			})

        except json.JSONDecodeError:
            return JsonResponse({"error": "Données JSON malformées."}, status=400)

    return JsonResponse({"error": "Méthode non autorisée."}, status=405)

def create_matches(tournament, players, round_number):
    matches = []
    i = 0
    while i + 1 < len(players):
        match = Match.objects.create(
            tournament=tournament,
            player1=players[i],
            player2=players[i + 1],
            round_number=round_number
        )
        matches.append(match)
        i += 2
    return matches





#@csrf_exempt
def get_tournament_details(request, tournament_id):
    print("✅ Vue API /tournament/api/details/ appelée avec ID:", tournament_id)
    print("✅ Appel à get_tournament_details avec ID:", tournament_id)
    
    try:
        tournament = Tournament.objects.get(id=tournament_id)
        players = list(tournament.players.values_list('nickname', flat=True))
        matches = list(tournament.matches.values(
            'id', 'round_number', 'is_finished',
            'player1__nickname', 'player2__nickname', 'winner__nickname'
        ))
        formatted_matches = []
        for m in matches:
            formatted_matches.append({
                'id': m['id'],
                'round': m['round_number'],
                'player1': m['player1__nickname'],
                'player2': m['player2__nickname'],
                'winner': m['winner__nickname'],
            })
        return JsonResponse({
            'tournament': {
                'id': tournament.id,
                'name': tournament.name,
                'time': tournament.time,
                'score_limit': tournament.score_limit,
            },
            'players': players,
            'matches': formatted_matches,
        })
    except Tournament.DoesNotExist:
        return JsonResponse({'error': 'Tournoi non trouvé'}, status=404)
#     return JsonResponse(data)


@require_GET
def tournament_details_json(request, tournament_id):
    tournament = get_object_or_404(Tournament, id=tournament_id)
    players = tournament.players.all()
    matches = tournament.matches.all().order_by('round_number')

    data = {
        "tournament": {
            "id": tournament.id,
            "name": tournament.name,
            "date": tournament.date,
			"score_limit": tournament.score_limit,
			"time": tournament.time,
        },
        "players": [p.nickname for p in players],
        "matches": [
            {
                "id": m.id,
                "round": m.round_number,
                "player1": m.player1.nickname if m.player1 else None,
                "player2": m.player2.nickname if m.player2 else None,
                "winner": m.winner.nickname if m.winner else None
            }
            for m in matches
        ]
    }
    return JsonResponse(data)

@csrf_exempt
@require_POST
def play_specific_match(request, tournament_id, match_id):
    try:
        match = Match.objects.get(id=match_id, tournament_id=tournament_id)

        if match.is_finished:
            return JsonResponse({"error": "Ce match est déjà terminé."}, status=400)

        return JsonResponse({
            "player1": match.player1.nickname,
            "player2": match.player2.nickname,
            "match_id": match.id,
            "round": match.round_number
        })

    except Match.DoesNotExist:
        return JsonResponse({"error": "Match introuvable."}, status=404)


@csrf_exempt
def play_next_match(request, tournament_id):
    if request.method != 'POST':
        return JsonResponse({"error": "Méthode non autorisée, utilisez POST."}, status=405)

    tournament = get_object_or_404(Tournament, id=tournament_id)
    match = tournament.matches.filter(is_finished=False).order_by("round_number").first()

    if not match:
        return JsonResponse({"error": "Tous les matchs sont terminés."}, status=400)

    return JsonResponse({
        "player1": match.player1.nickname,
        "player2": match.player2.nickname,
        "match_id": match.id,
        "round": match.round_number
    })

def get_current_tournament_id(request):
    tid = request.session.get("current_tournament_id")
    if not tid:
        return JsonResponse({"error": "Aucun tournoi actif"}, status=404)
    return JsonResponse({"tournament_id": tid})

@csrf_exempt
@require_POST
def finish_match(request, tournament_id, match_id):
    match = get_object_or_404(Match, id=match_id, tournament_id=tournament_id)
    if match.is_finished:
        return JsonResponse({"error": "Ce match est déjà terminé."}, status=400)

    try:
        data = json.loads(request.body)
        winner_nickname = data.get("winner")
        score1 = data.get("score1")
        score2 = data.get("score2")

        if winner_nickname not in [match.player1.nickname, match.player2.nickname]:
            return JsonResponse({"error": "Le gagnant doit être l'un des deux joueurs."}, status=400)

        winner = match.player1 if match.player1.nickname == winner_nickname else match.player2
        match.winner = winner
        match.score1 = score1
        match.score2 = score2
        match.is_finished = True
        match.save()

        tournament = match.tournament
        current_round = match.round_number

        # Vérifie si tous les matchs du round sont terminés
        if tournament.matches.filter(round_number=current_round, is_finished=False).exists():
            return JsonResponse({"message": "Match terminé et enregistré."})

        # Tous les matchs sont terminés
        winners = list(tournament.matches.filter(round_number=current_round).values_list('winner', flat=True))
        winner_players = list(Player.objects.filter(id__in=winners))

        if len(winner_players) == 1:
            tournament.winner = winner_players[0].nickname
            tournament.save()
            return JsonResponse({"message": f"Tournoi terminé. Vainqueur: {tournament.winner}"})

        # Si impair, on met de côté un joueur pour plus tard
        exempted_player = None
        if len(winner_players) % 2 == 1:
            exempted_player = winner_players.pop()

        # Crée les matchs suivants
        new_matches = create_matches(tournament, winner_players, round_number=current_round + 1)

        # Si on avait mis un joueur de côté, on le fait avancer directement au prochain round
        if exempted_player:
            match = Match.objects.create(
                tournament=tournament,
                player1=exempted_player,
                player2=exempted_player,
                winner=exempted_player,
                is_finished=True,
                round_number=current_round + 1
            )

        return JsonResponse({"message": "Match terminé et round suivant généré."})

    except json.JSONDecodeError:
        return JsonResponse({"error": "Requête invalide (JSON)."}, status=400)




@require_GET
def list_tournaments(request):
    tournois = Tournament.objects.all().order_by('-id')[:10]  # tri par ID descendant
    return JsonResponse({
        "tournaments": [
            {"id": t.id, "name": t.name, "num_players": t.num_players, "winner": t.winner}
            for t in tournois
        ]
    })

@csrf_exempt
@require_POST
def set_current_tournament_id(request):
    try:
        data = json.loads(request.body)
        tid = data.get("tournament_id")
        if not Tournament.objects.filter(id=tid).exists():
            return JsonResponse({"error": "Tournoi introuvable"}, status=404)
        request.session["current_tournament_id"] = tid
        return JsonResponse({"success": True})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)