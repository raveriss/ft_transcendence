from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
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

            tournament = Tournament.objects.create(name=name, num_players=num_players)
            players = [Player.objects.create(tournament=tournament, nickname=nick) for nick in player_nicknames]

            random.shuffle(players)

            first_round_matches = create_matches(tournament, players, round_number=1)

            return JsonResponse({
                "message": name,
                "tournament_id": tournament.id,
                "players": [p.nickname for p in players],
                "matches": [
                    {
                        "player1_nickname": m.player1.nickname,
                        "player2_nickname": m.player2.nickname,
                        "round": m.round_number
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

@csrf_exempt
def tournament_details(request, tournament_id):
    tournament = get_object_or_404(Tournament, id=tournament_id)
    data = {
        "id": tournament.id,
        "name": tournament.name,
        "winner": tournament.winner,
        "players": [player.nickname for player in tournament.players.all()],
        "matches": [
            {
                "player1": match.player1.nickname,
                "player2": match.player2.nickname,
                "round": match.round_number,
                "is_finished": match.is_finished,
                "winner": match.winner.nickname if match.winner else None
            }
            for match in tournament.matches.all()
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
