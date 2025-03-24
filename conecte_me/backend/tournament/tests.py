# tournament/tests.py

from django.test import TestCase
from .models import Tournament, Player, Match

class TournamentTests(TestCase):
    def test_create_tournament(self):
        response = self.client.post('/tournament/create/', {
            'name': 'Test Tournament',
            'num_players': 4,
            'player_nicknames[]': ['player1', 'player2', 'player3', 'player4'],
        })
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Tournoi créé !')

class TournamentTestCase(TestCase):

    def setUp(self):
        # Création d'un tournoi et de joueurs pour les tests
        self.tournament = Tournament.objects.create(name="Test Tournament", num_players=4)
        self.player1 = Player.objects.create(tournament=self.tournament, nickname="Player 1")
        self.player2 = Player.objects.create(tournament=self.tournament, nickname="Player 2")
        self.player3 = Player.objects.create(tournament=self.tournament, nickname="Player 3")
        self.player4 = Player.objects.create(tournament=self.tournament, nickname="Player 4")

    def test_tournament_creation(self):
        """Test la création d'un tournoi"""
        self.assertEqual(self.tournament.name, "Test Tournament")
        self.assertEqual(self.tournament.num_players, 4)

    def test_player_creation(self):
        """Test la création d'un joueur"""
        self.assertEqual(self.player1.nickname, "Player 1")
        self.assertEqual(self.player2.nickname, "Player 2")

    def test_match_creation(self):
        """Test la création d'un match"""
        match = Match.objects.create(
            tournament=self.tournament,
            player1=self.player1,
            player2=self.player2,
            round_number=1
        )
        self.assertEqual(match.player1.nickname, "Player 1")
        self.assertEqual(match.player2.nickname, "Player 2")
