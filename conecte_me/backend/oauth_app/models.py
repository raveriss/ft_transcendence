from django.db import models
from django.contrib.auth.hashers import make_password

class User42(models.Model):
    user_id = models.IntegerField(unique=True)
    username = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    first_name = models.CharField(max_length=50, null=False, default="Unknown")
    email_address = models.EmailField(unique=True, null=False, default="placeholder@example.com")
    password = models.CharField(max_length=128, null=False, default="to_be_hashed")

    # Champs pour l'authentification 2FA
    totp_secret = models.CharField(max_length=32, blank=True, null=True)
    is_2fa_enabled = models.BooleanField(default=False)

    # Nouveau champ pour l'image de profil
    profile_image = models.ImageField(
        upload_to='profile_pictures/',
        default='profile_pictures/default.jpg'
    )

    def __str__(self):
        return f"{self.username} ({self.email_address})"

    def set_password(self, raw_password: str):
        self.password = make_password(raw_password)
