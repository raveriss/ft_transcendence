# game/urls.py
from django.urls import path
from .views import game_settings_api, match_history_api, match_history_list, leaderboard

urlpatterns = [
    path('', game_settings_api, name='game_settings_api'),
    path('match_history/', match_history_api, name='match_history_api'),
    path('match_history/list/', match_history_list, name='match_history_list'),
    path('leaderboard/', leaderboard, name='leaderboard'),
]
