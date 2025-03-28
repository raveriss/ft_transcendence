from django.db import models

class Tournament(models.Model):
    name = models.CharField(max_length=255)
    num_players = models.IntegerField()
    winner = models.CharField(max_length=255, null=True, blank=True)
    score_limit = models.IntegerField(default=5)
    time = models.IntegerField(default=120)  # durée en secondes

    def __str__(self):
        return self.name

class Player(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name="players")
    nickname = models.CharField(max_length=255)

    def __str__(self):
        return self.nickname

class Match(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name="matches")
    player1 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name="match_player1")
    player2 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name="match_player2")
    winner = models.ForeignKey(Player, on_delete=models.SET_NULL, null=True, blank=True, related_name="won_matches")
    round_number = models.IntegerField()
    is_finished = models.BooleanField(default=False)

    def __str__(self):
        return f"Match {self.round_number} : {self.player1.nickname if self.player1 else '???'} vs {self.player2.nickname if self.player2 else '???'}"