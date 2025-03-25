from django.shortcuts import render, get_object_or_404
from .models import Tournament, Player, Match
from django.http import JsonResponse
import random
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
# def create_tournament(request):
#     if request.method == "POST":
#         try:
#             # Charger le corps de la requête JSON
#             data = json.loads(request.body)
#             name = data.get("name")
#             num_players = int(data.get("num_players"))
#             player_nicknames = data.get("player_nicknames", [])

#             # Validation des données d'entrée
#             if not name or not player_nicknames:
#                 return JsonResponse({"error": "Le nom du tournoi et les pseudos des joueurs sont requis."}, status=400)
            
#             if len(player_nicknames) != num_players:
#                 return JsonResponse({"error": "Le nombre de pseudos ne correspond pas au nombre de joueurs."}, status=400)

#             # Création du tournoi et des joueurs
#             tournament = Tournament.objects.create(name=name, num_players=num_players)
#             players = [Player.objects.create(tournament=tournament, nickname=nick) for nick in player_nicknames]

#             # Tirage au sort des joueurs
#             random.shuffle(players)

#             # Création des matchs
#             create_matches(tournament, players, round_number=1)

#             return JsonResponse({"message": "Tournoi créé avec succès !", "tournament_id": tournament.id})

#         except json.JSONDecodeError:
#             return JsonResponse({"error": "Données JSON malformées."}, status=400)

#     return JsonResponse({"error": "Méthode non autorisée."}, status=405)


@csrf_exempt
def create_tournament(request):
    if request.method == "POST":
        try:
            # Charger le corps de la requête JSON
            data = json.loads(request.body)
            name = data.get("name")
            num_players = int(data.get("num_players"))
            player_nicknames = data.get("player_nicknames", [])

            # Validation des données d'entrée
            if not name or not player_nicknames:
                return JsonResponse({"error": "Le nom du tournoi et les pseudos des joueurs sont requis."}, status=400)
            
            if len(player_nicknames) != num_players:
                return JsonResponse({"error": "Le nombre de pseudos ne correspond pas au nombre de joueurs."}, status=400)

            # Création du tournoi et des joueurs
            tournament = Tournament.objects.create(name=name, num_players=num_players)
            players = [Player.objects.create(tournament=tournament, nickname=nick) for nick in player_nicknames]

            # Tirage au sort des joueurs
            random.shuffle(players)

            # Création des matchs
            create_matches(tournament, players, round_number=1)

            # Retourne la réponse avec le tournament_id
            return JsonResponse({
                "message": "Tournoi créé avec succès !", 
                "tournament_id": tournament.id
            })

        except json.JSONDecodeError:
            return JsonResponse({"error": "Données JSON malformées."}, status=400)

    return JsonResponse({"error": "Méthode non autorisée."}, status=405)


@csrf_exempt
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


@csrf_exempt
def play_next_match(request, tournament_id):
    if request.method != 'POST':
        return JsonResponse({"error": "Méthode non autorisée, utilisez POST."}, status=405)

    tournament = get_object_or_404(Tournament, id=tournament_id)
    match = tournament.matches.filter(is_finished=False).order_by("round_number").first()

    if not match:
        return JsonResponse({"error": "Tous les matchs sont terminés."}, status=400)

    # Lancer le jeu (à adapter avec ta fonction réelle)
    # game_response = start_game(match.player1.nickname, match.player2.nickname)
    game_response = {"winner": random.choice([match.player1.nickname, match.player2.nickname])}  # Exemple de réponse pour test

    if not game_response:
        return JsonResponse({"error": "Erreur dans le lancement du jeu."}, status=500)

    # Sauvegarde du gagnant et fin du match
    match.winner = game_response["winner"]
    match.is_finished = True
    match.save()

    # Vérifier si le tournoi est terminé
    remaining_matches = tournament.matches.filter(is_finished=False).count()
    if remaining_matches == 0:
        # Trouver les gagnants du tour
        winners = [m.winner for m in tournament.matches.filter(is_finished=True)]

        if len(winners) == 1:
            tournament.winner = winners[0]
            tournament.save()
            return JsonResponse({"message": f"Tournoi terminé. Vainqueur: {tournament.winner}"})

        # Création des matchs pour le prochain tour avec les gagnants
        create_matches(tournament, winners, round_number=tournament.matches.aggregate(
            max_round=models.Max('round_number'))['max_round'] + 1)

    return JsonResponse({"message": f"Match terminé. Vainqueur: {match.winner}"})
