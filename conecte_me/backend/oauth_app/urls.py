# backend/oauth_app/urls.py
from django.urls import path
from .views import (
    redirect_to_42,
    callback_42,
    signup_view,
    login_view,
    user_info,  # <--- Import de la nouvelle vue
    upload_avatar_view,
    set_42_password_view,
    update_email_view,  # Import de la nouvelle vue
    update_password_view,
    export_data_view,
    delete_account_view,
)
from . import twofa_views

urlpatterns = [
    path('signup/', signup_view, name='signup'),
    path('login/', login_view, name='login'),
    path('login-42/', redirect_to_42, name='redirect_to_42'),
    path('callback', callback_42, name='callback_42'),
    path('42/password/', set_42_password_view, name='set_42_password'),  # <== Ajouté ici

    path('2fa/setup/', twofa_views.two_factor_setup, name='two_factor_setup'),
    path('2fa/validate/', twofa_views.two_factor_validate, name='two_factor_validate'),
    # Nouvelle route pour récupérer le username
    path('user/', user_info, name='user_info'),

    path('user/upload_avatar/', upload_avatar_view, name='upload_avatar'),
    path('user/update_email/', update_email_view, name='update_email'),
    path("user/update_password/", update_password_view, name="update_password"),
    path('user/export_data/', export_data_view, name='export_data'),
    path('user/delete_account/', delete_account_view, name='delete_account'),


]
