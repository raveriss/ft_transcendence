from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
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
    for i in range(0, len(players), 2):
        if i + 1 < len(players):
            match = Match.objects.create(
                tournament=tournament,
                player1=players[i],
                player2=players[i + 1],
                round_number=round_number
            )
            matches.append(match)
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
def finish_match(request, tournament_id, match_id):
    if request.method != 'POST':
        return JsonResponse({"error": "Méthode non autorisée."}, status=405)

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

        if not tournament.matches.filter(round_number=current_round, is_finished=False).exists():
            winners = [m.winner for m in tournament.matches.filter(round_number=current_round, is_finished=True)]
            if len(winners) == 1:
                tournament.winner = winners[0].nickname
                tournament.save()
                return JsonResponse({"message": f"Tournoi terminé. Vainqueur: {tournament.winner}"})
            else:
                create_matches(tournament, winners, round_number=current_round + 1)

        return JsonResponse({"message": "Match terminé et enregistré."})

    except json.JSONDecodeError:
        return JsonResponse({"error": "Requête invalide (JSON)."}, status=400)
