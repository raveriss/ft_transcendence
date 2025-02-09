# backend/oauth_app/urls.py
from django.urls import path
from .views import (
    redirect_to_42,
    callback_42,
    signup_view,
    login_view,
    user_info,  # <--- Import de la nouvelle vue
)
from . import twofa_views

urlpatterns = [
    path('signup/', signup_view, name='signup'),
    path('login/', login_view, name='login'),
    path('login-42/', redirect_to_42, name='redirect_to_42'),
    path('callback', callback_42, name='callback_42'),
    path('2fa/setup/', twofa_views.two_factor_setup, name='two_factor_setup'),
    path('2fa/validate/', twofa_views.two_factor_validate, name='two_factor_validate'),
    # Nouvelle route pour récupérer le username
    path('user/', user_info, name='user_info'),
]
