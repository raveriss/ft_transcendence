from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Tournament, Player, Match
import random, json
from django.db.models import F

@csrf_exempt
def create_tournament(request):
    if request.method != "POST":
        return JsonResponse({"error": "Méthode non autorisée."}, status=405)

    try:
        data = json.loads(request.body)
        name = data.get("name")
        num_players = int(data.get("num_players"))
        player_nicknames = data.get("player_nicknames", [])

        if not name or not player_nicknames or len(player_nicknames) != num_players:
            return JsonResponse({"error": "Données invalides."}, status=400)

        tournament = Tournament.objects.create(name=name, num_players=num_players)
        players = [Player.objects.create(tournament=tournament, nickname=nick) for nick in player_nicknames]
        random.shuffle(players)

        create_matches(tournament, players, round_number=1)

        return JsonResponse({
            "message": tournament.name,
            "tournament_id": tournament.id,
            "players": [p.nickname for p in players],
            "matches": list(Match.objects.filter(tournament=tournament).values(
                player1_nickname=F("player1__nickname"),
                player2_nickname=F("player2__nickname"),
                round=F("round_number")
            ))
        })

    except json.JSONDecodeError:
        return JsonResponse({"error": "Données JSON malformées."}, status=400)


def create_matches(tournament, players, round_number):
    if len(players) < 2:
        return

    next_round_players = []

    for i in range(0, len(players), 2):
        if i + 1 < len(players):
            p1 = players[i]
            p2 = players[i + 1]
            Match.objects.create(
                tournament=tournament,
                player1=p1,
                player2=p2,
                round_number=round_number
            )
            # on ajoute arbitrairement p1 comme "gagnant par défaut" pour permettre de générer tous les matchs
            next_round_players.append(p1)

    if len(next_round_players) > 1:
        create_matches(tournament, next_round_players, round_number + 1)


@csrf_exempt
def get_tournament(request, tournament_id):
    tournament = get_object_or_404(Tournament, id=tournament_id)
    data = {
        "id": tournament.id,
        "name": tournament.name,
        "players": [player.nickname for player in tournament.players.all()],
        "matches": [
            {
                "player1": match.player1.nickname,
                "player2": match.player2.nickname,
                "round": match.round_number,
                "finished": match.is_finished,
                "winner": match.winner.nickname if match.winner else None
            } for match in tournament.matches.all()
        ],
        "winner": tournament.winner
    }
    return JsonResponse(data)


@csrf_exempt
def play_next_match(request, tournament_id):
    print("➡️ play_next_match appelée avec", request.method)
    if request.method != 'POST':
        return JsonResponse({"error": "Méthode non autorisée, utilisez POST."}, status=405)

    tournament = get_object_or_404(Tournament, id=tournament_id)
    match = tournament.matches.filter(is_finished=False).order_by("round_number").first()

    if not match:
        return JsonResponse({"error": "Tous les matchs sont terminés."}, status=400)

    winner = random.choice([match.player1, match.player2])
    match.winner = winner
    match.is_finished = True
    match.save()

    # Vérifier s'il reste des matchs
    if not tournament.matches.filter(is_finished=False).exists():
        # Dernier round : déterminer le gagnant
        winners = [
            m.winner for m in tournament.matches.filter(is_finished=True)
            if m.round_number == match.round_number
        ]
        if len(winners) == 1:
            tournament.winner = winners[0].nickname
            tournament.save()
            return JsonResponse({"message": f"Tournoi terminé. Vainqueur: {tournament.winner}"})
        else:
            # Créer les matchs du prochain tour
            create_matches(tournament, winners, round_number=match.round_number + 1)

    return JsonResponse({
        "message": f"{match.player1.nickname} vs {match.player2.nickname} terminé.",
        "gagnant": winner.nickname
    })
