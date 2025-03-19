# game/urls.py
from django.urls import path
from .views import game_settings_api

urlpatterns = [
    path('', game_settings_api, name='game_settings_api'),
]
