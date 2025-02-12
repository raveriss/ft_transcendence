from django.db import models

class Tournoi(models.Model):
    nom = models.CharField(max_length=100, unique=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nom

class Joueur(models.Model):
    pseudo = models.CharField(max_length=50)
    tournoi = models.ForeignKey(Tournoi, on_delete=models.CASCADE, related_name="joueurs")

    def __str__(self):
        return f"{self.pseudo} ({self.tournoi.nom})"

