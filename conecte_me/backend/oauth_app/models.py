# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */
# /*                      IMPORTS DU FRAMEWORK DJANGO                          */
# /*   -'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-',-'   */

# Importation du module models de Django pour définir des modèles de données.
from django.db import models

# Importation de la fonction make_password pour sécuriser (hasher) les mots de passe.
from django.contrib.auth.hashers import make_password

# Importation de now depuis django.utils.timezone pour obtenir la date et l'heure actuelles.
from django.utils.timezone import now

from django.db.models import Q #importation de Q pour gerer les requetes d'amis

# Définition du modèle User42 pour représenter un utilisateur provenant de l'école 42.
class User42(models.Model):

    # Déclaration d'un champ entier unique pour l'identifiant de l'utilisateur.
    user_id = models.IntegerField(unique=True)

    # Champ texte pour le nom d'utilisateur, avec une longueur maximale de 255 caractères.
    username = models.CharField(max_length=255, unique=True)

    # Champ date/heure qui s'initialise automatiquement à la date de création de l'enregistrement.
    created_at = models.DateTimeField(auto_now_add=True)

    # Champ texte pour le prénom, obligatoire avec une longueur maximale de 50 caractères et une valeur par défaut.
    first_name = models.CharField(max_length=50, null=False, default="Unknown")

    # Champ email obligatoire et unique avec une valeur par défaut, afin de garantir l'unicité de l'adresse.
    email_address = models.EmailField(unique=True, null=False, default="placeholder@example.com")

    # Champ pour stocker le mot de passe haché, avec une longueur maximale de 128 caractères.
    password = models.CharField(max_length=128, null=False, default="to_be_hashed")

    # ------------------------
    # Champs pour l'authentification à deux facteurs (2FA)
    # ------------------------
    # Champ texte optionnel pour stocker le secret TOTP, nécessaire pour générer les codes de 2FA.
    totp_secret = models.CharField(max_length=32, blank=True, null=True)

    # Champ booléen indiquant si l'authentification 2FA est activée pour l'utilisateur.
    is_2fa_enabled = models.BooleanField(default=True)

    # ------------------------
    # Champ pour l'image de profil de l'utilisateur
    # ------------------------
    # Champ image permettant de stocker l'avatar de l'utilisateur.
    # L'image sera enregistrée dans le dossier 'profile_pictures/' et un avatar par défaut est défini.
    profile_image = models.ImageField(
        upload_to='profile_pictures/',
        default='profile_pictures/default_avatar.png'
    )

    # Méthode spéciale __str__ pour représenter l'objet sous forme de chaîne de caractères,
    # ce qui facilite l'identification de l'objet dans l'administration et lors du débogage.
    def __str__(self):
        return f"{self.username} ({self.email_address})"

    # Méthode permettant de définir et de hacher le mot de passe de l'utilisateur.
    # L'utilisation de make_password permet d'assurer la sécurité en stockant le mot de passe sous forme hachée.
    def set_password(self, raw_password: str):
        self.password = make_password(raw_password)

    # service game_gamesettings
    # Indique que le champ 'username' sera utilisé comme identifiant unique pour l'authentification.
    USERNAME_FIELD = 'username'

    # Spécifie les champs obligatoires (en plus de USERNAME_FIELD) lors de la création d'un utilisateur via createsuperuser.
    REQUIRED_FIELDS = ['email_address']

    # Propriété qui indique que cet utilisateur n'est jamais considéré comme anonyme.
    @property
    def is_anonymous(self):
        return False
    
    # Propriété qui indique que cet utilisateur est toujours considéré comme authentifié.
    @property
    def is_authenticated(self):
        return True
    
    # Méthode pour obtenir les amis de l'utilisateur.
    def get_friends(self):
        from oauth_app.models import Friendship
        return User42.objects.filter(
        Q(sent_friend_requests__receiver=self, sent_friend_requests__is_accepted=True) |
        Q(received_friend_requests__sender=self, received_friend_requests__is_accepted=True)
    ).distinct()


# Définition du modèle UserLoginHistory pour conserver un historique des connexions des utilisateurs.
class UserLoginHistory(models.Model):

    # Clé étrangère reliant chaque enregistrement à un utilisateur spécifique.
    # La suppression d'un utilisateur entraîne également la suppression de son historique (CASCADE).
    user = models.ForeignKey('User42', on_delete=models.CASCADE)

    # Champ date/heure qui enregistre le moment de la connexion en utilisant l'heure actuelle par défaut.
    timestamp = models.DateTimeField(default=now)

    # Champ pour enregistrer l'adresse IP depuis laquelle l'utilisateur s'est connecté.
    ip_address = models.GenericIPAddressField()

    # Champ texte pour stocker les informations du navigateur ou agent utilisateur, utile pour le diagnostic.
    user_agent = models.TextField()

    # Champ booléen pour indiquer l'état de connexion (connecté/déconnecté) de l'utilisateur.
    is_connected = models.BooleanField(default=False)  # Nouveau champ pour l'état de connexion

    # Classe Meta pour configurer des options spécifiques au modèle.
    class Meta:

        # Définition de l'ordre par défaut des enregistrements : les plus récents en premier.
        ordering = ['-timestamp']

    # Méthode spéciale __str__ pour fournir une représentation lisible de l'historique de connexion.
    def __str__(self):
        return f"Connexion de {self.user.username} - {self.timestamp}"
    
    # Modèle représentant une relation d'amitié entre deux utilisateurs.
class Friendship(models.Model):
    # L'utilisateur qui envoie la demande d'amitié.
    sender = models.ForeignKey(
        User42,
        related_name='sent_friend_requests',
        on_delete=models.CASCADE
    )

    # L'utilisateur qui reçoit la demande d'amitié.
    receiver = models.ForeignKey(
        User42,
        related_name='received_friend_requests',
        on_delete=models.CASCADE
    )

    # Statut de la demande : False = en attente, True = acceptée.
    is_accepted = models.BooleanField(default=False)

    # Date de création de la demande.
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Empêche les doublons (une même relation sender→receiver ne peut pas être créée deux fois).
        unique_together = ('sender', 'receiver')

    def __str__(self):
        status = "amis" if self.is_accepted else "en attente"
        return f"{self.sender.username} → {self.receiver.username} ({status})"

