from django.db import models

class User42(models.Model):
    user_id = models.IntegerField(unique=True)
    username = models.CharField(max_length=255)
    # Vous pouvez ajouter d’autres champs si besoin (scopes, email, etc.)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username
