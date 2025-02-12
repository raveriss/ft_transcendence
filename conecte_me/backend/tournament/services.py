import random
from .models import Tournament, Player, Match

def create_matchmaking(tournament_id):
    tournament = Tournament.objects.get(id=tournament_id)
    players = list(Player.objects.filter(tournament=tournament))
    random.shuffle(players)  # Mélange les joueurs pour un matchmaking aléatoire

    matches = []
    for i in range(0, len(players), 2):
        if i + 1 < len(players):
            match = Match.objects.create(
                tournament=tournament,
                player1=players[i],
                player2=players[i + 1]
            )
            matches.append(match)

    return matches

