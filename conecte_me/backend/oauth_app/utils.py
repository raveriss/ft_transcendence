# Importation du module os pour les opérations système (bien qu'il ne soit pas utilisé directement ici)
import os

# Importation de la bibliothèque jwt pour encoder et décoder des JSON Web Tokens (JWT)
import jwt

# Importation du module datetime pour manipuler les dates et heures
import datetime

# Importation des paramètres de configuration de Django, notamment pour accéder à SECRET_KEY
from django.conf import settings  # Importer les settings de Django

# Importation de l'exception IntegrityError qui permet d'attraper les erreurs
# liées aux contraintes d'unicité ou de base de données lors des insertions.
from django.db import IntegrityError

# Importation des modèles utilisés :
# - User42 : modèle d'utilisateur (ton modèle custom pour 42 + local)
# - Friendship : modèle représentant une demande ou une relation d’amitié
from oauth_app.models import User42, Friendship

# Importation des outils nécessaires :
# - ObjectDoesNotExist : pour capturer les cas où aucune demande n'existe
from django.core.exceptions import ObjectDoesNotExist

# Définition de la fonction generate_jwt qui génère un token JWT pour un utilisateur donné
def generate_jwt(user_id, username):


    # Récupération de la clé secrète définie dans settings.py pour signer le token
    secret_key = settings.SECRET_KEY

    # Définition de l'expiration du token : l'heure UTC actuelle plus 1 heure
    expiration = datetime.datetime.utcnow() + datetime.timedelta(hours=1)

    # Création du payload du token contenant les informations utilisateur et les métadonnées du token
    payload = {
        'user_id': user_id,       # Stocke l'identifiant unique de l'utilisateur
        'username': username,     # Stocke le nom d'utilisateur pour référence
        'exp': expiration,        # Date et heure d'expiration du token, après laquelle il ne sera plus valide
        'iss': 'ConecteMe'        # Identifiant de l'émetteur du token (issuer)
    }

    # Encodage du payload en un token JWT en utilisant la clé secrète et l'algorithme HS256
    token = jwt.encode(payload, secret_key, algorithm='HS256')

    # Retourne le token généré
    return token

def send_friend_request(sender: User42, receiver: User42) -> tuple[bool, str]:
    """
    Envoie une demande d'ami de `sender` vers `receiver`.
    Retourne un tuple (succès: bool, message: str) expliquant le résultat.
    """

    # 🚫 Vérifie que l'utilisateur n'essaie pas de s'ajouter lui-même.
    if sender == receiver:
        return False, "Vous ne pouvez pas vous ajouter vous-même."

    # 🔍 Vérifie s’il existe déjà une relation entre les deux utilisateurs,
    # dans un sens ou dans l’autre (sender→receiver ou receiver→sender).
    existing = Friendship.objects.filter(
        sender=sender, receiver=receiver
    ).union(
        Friendship.objects.filter(sender=receiver, receiver=sender)
    )

    # ⛔ S’il y a déjà une demande ou une relation, on bloque l'envoi.
    if existing.exists():
        return False, "Une demande existe déjà entre ces deux utilisateurs."

    try:
        # ✅ Si tout est bon, on crée la demande d’amitié.
        # Elle est en attente (is_accepted=False par défaut).
        Friendship.objects.create(sender=sender, receiver=receiver)
        return True, "Demande envoyée avec succès."

    except IntegrityError:
        # ⚠️ En cas d’erreur d'intégrité (par exemple contrainte unique violée).
        return False, "Erreur lors de la création de la demande."
    
def accept_friend_request(receiver: User42, sender: User42) -> tuple[bool, str]:
    """
    Permet à `receiver` d’accepter une demande d’ami envoyée par `sender`.
    Retourne un tuple (succès: bool, message: str).
    """

    try:
        # 🔍 On cherche une demande envoyée par `sender` et reçue par `receiver`,
        # qui est toujours en attente (is_accepted=False).
        friendship = Friendship.objects.get(
            sender=sender,
            receiver=receiver,
            is_accepted=False
        )

        # ✅ On marque la demande comme acceptée.
        friendship.is_accepted = True
        friendship.save()

        return True, "Demande d’ami acceptée."

    except ObjectDoesNotExist:
        # ⚠️ Aucune demande correspondante trouvée → échec
        return False, "Aucune demande d’ami en attente de cet utilisateur."

    except Exception as e:
        # ⚠️ Cas imprévu : erreur technique
        return False, f"Erreur inattendue : {str(e)}"

def remove_friendship(user1: User42, user2: User42) -> tuple[bool, str]:
    """
    Supprime une demande d’ami ou une relation d’amitié existante entre deux utilisateurs,
    dans n’importe quel sens.
    Retourne un tuple (succès: bool, message: str).
    """

    # 🔍 On cherche une relation entre les deux utilisateurs dans un sens OU dans l’autre
    try:
        friendship = Friendship.objects.get(
            sender=user1, receiver=user2
        )
    except ObjectDoesNotExist:
        try:
            friendship = Friendship.objects.get(
                sender=user2, receiver=user1
            )
        except ObjectDoesNotExist:
            return False, "Aucune relation ou demande existante entre ces deux utilisateurs."

    # 🗑️ Une relation a été trouvée, on la supprime
    friendship.delete()
    return True, "Relation supprimée avec succès."