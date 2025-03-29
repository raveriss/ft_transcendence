# backend/oauth_app/urls.py

# Importation de la fonction path depuis django.urls pour définir les routes URL.
from django.urls import path

# Importation de plusieurs vues spécifiques depuis le module views pour gérer l'authentification et la gestion utilisateur.
from .views import (
    redirect_to_42,             # Vue pour rediriger l'utilisateur vers l'authentification de l'école 42.
    callback_42,                # Vue pour gérer le callback après l'authentification OAuth 42.
    signup_view,                # Vue pour traiter l'inscription des utilisateurs.
    login_view,                 # Vue pour traiter la connexion des utilisateurs.
    user_info,                  # Nouvelle vue pour récupérer les informations de l'utilisateur.
    upload_avatar_view,         # Vue pour gérer le téléchargement de l'avatar utilisateur.
    set_42_password_view,       # Vue pour permettre de définir le mot de passe spécifique à 42.
    update_email_view,          # Nouvelle vue pour mettre à jour l'adresse email de l'utilisateur.
    update_password_view,       # Vue pour gérer la mise à jour du mot de passe.
    export_data_view,           # Vue pour exporter les données de l'utilisateur.
    delete_account_view,        # Vue pour supprimer le compte utilisateur.
    user_login_history,         # Vue pour afficher l'historique des connexions de l'utilisateur.
    update_login_status,        # Vue pour mettre à jour le statut de connexion de l'utilisateur.
    friend_request_view,        # Vue pour gérer les demandes d'ami.
    accept_friend_request_view, # Vue pour accepter une demande d'ami.
)

# Importation des modules twofa_views et views qui contiennent respectivement les vues de l'authentification à deux facteurs et d'autres vues complémentaires.
from . import twofa_views, views

# Définition des URL patterns associant des chemins URL aux vues correspondantes.
urlpatterns = [

    # Route pour l'inscription des utilisateurs.
    path('signup/', signup_view, name='signup'),

    # Route pour la connexion des utilisateurs.
    path('login/', login_view, name='login'),

    # Route pour rediriger l'utilisateur vers l'authentification via l'API 42.
    path('login-42/', redirect_to_42, name='redirect_to_42'),

    # Route pour gérer le callback après l'authentification OAuth 42.
    path('callback', callback_42, name='callback_42'),

    # Route pour configurer la 2FA, affichant le QR Code pour la configuration.
    path('2fa/setup/', twofa_views.two_factor_setup, name='two_factor_setup'),

    # Route pour valider le code 2FA saisi par l'utilisateur.
    path('2fa/validate/', twofa_views.two_factor_validate, name='two_factor_validate'),

    # Route pour activer/désactiver la 2FA pour l'utilisateur.
    path('user/toggle_2fa/', views.toggle_2fa, name='toggle_2fa'),

    # Nouvelle route pour récupérer les informations de l'utilisateur (username).
    path('user/', user_info, name='user_info'),

    # Route pour permettre le téléchargement de l'avatar utilisateur.
    path('user/upload_avatar/', upload_avatar_view, name='upload_avatar'),

    # Route pour mettre à jour l'adresse email de l'utilisateur.
    path('user/update_email/', update_email_view, name='update_email'),

    # Route pour mettre à jour le mot de passe de l'utilisateur.
    path("user/update_password/", update_password_view, name="update_password"),

    # Route pour mettre à jour le nom d'utilisateur.
    path("user/update_username/", views.update_username_view, name="update_username"),

    # Route pour exporter les données personnelles de l'utilisateur.
    path('user/export_data/', export_data_view, name='export_data'),

    # Route pour supprimer le compte utilisateur.
    path('user/delete_account/', delete_account_view, name='delete_account'),

    # Route pour accéder à l'historique des connexions de l'utilisateur.
    path('user/login_history/', user_login_history, name='user_login_history'),

    # Route pour mettre à jour le statut de connexion de l'utilisateur.
    path('user/update_login_status/', update_login_status, name='update_login_status'),

    # Route pour déconnecter l'utilisateur.
    path('logout/', views.logout_view, name='logout'),

    # Route pour refuser une demande d'ami ou supprimer une relation.
    path('friends/remove/', views.remove_friend_view, name='remove_friend'),
    path('friends/request/', friend_request_view, name='friend_request'),
    path('friends/accept/', accept_friend_request_view, name='accept_friend'),
]
