from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from .models import Tournament, Player, Match
from game.views import start_game  # Import fctn du jeu
import random

def create_tournament(request):
    if request.method == "POST":
        name = request.POST.get("name")
        num_players = int(request.POST.get("num_players"))
        player_nicknames = request.POST.getlist("player_nicknames[]")

        if len(player_nicknames) != num_players:
            return JsonResponse({"error": "Le nombre de pseudos ne correspond pas au nombre de joueurs."}, status=400)

        tournament = Tournament.objects.create(name=name, num_players=num_players)
        players = [Player.objects.create(tournament=tournament, nickname=nick) for nick in player_nicknames]

        # tirage au sort
        random.shuffle(players)

        # matchmaking
        create_matches(tournament, players, round_number=1)

        return JsonResponse({"message": "Tournoi créé avec succès !", "tournament_id": tournament.id})

    return JsonResponse({"error": "Une erreur est survenue."}, status=400)



def create_matches(tournament, players, round_number):
    """Créer les matchs pour chaque tour"""
    matches = [
        Match.objects.create(
            tournament=tournament,
            player1=players[i],
            player2=players[i + 1],
            round_number=round_number
        )
        for i in range(0, len(players), 2)
    ]
    return matches


def play_next_match(request, tournament_id):
    tournament = get_object_or_404(Tournament, id=tournament_id)
    match = tournament.matches.filter(is_finished=False).order_by("round_number").first()

    if not match:
        return JsonResponse({"error": "Tous les matchs sont terminés."}, status=400)

    #ic je lance le jeu mais à adapter avec la focntion de game
    game_response = start_game(match.player1.nickname, match.player2.nickname)

    if game_response.get("error"):
        return JsonResponse({"error": game_response["error"]}, status=500)

    # save winner + fin du match
    match.winner = game_response["winner"]
    match.is_finished = True
    match.save()

    # Vérifier si le tournoi est terminé
    remaining_matches = tournament.matches.filter(is_finished=False).count()
    if remaining_matches == 0:
        # Trouver les gagnants du tour
        winners = [m.winner for m in tournament.matches.filter(is_finished=True)]

        if len(winners) == 1:
            tournament.winner = winners[0].nickname
            tournament.save()
            return JsonResponse({"message": f"Tournoi terminé. Vainqueur: {tournament.winner}"})

        # matchmaking avec les gagnants
        create_matches(tournament, winners, round_number=tournament.matches.aggregate(
            max_round=models.Max('round_number'))['max_round'] + 1)

    return JsonResponse({"message": f"Match terminé. Vainqueur: {match.winner.nickname}"})
