# game/urls.py
from django.urls import path
from .views import game_settings_api, match_history_api, match_history_list, match_history_all, leaderboard, user_stats

urlpatterns = [
    path('', game_settings_api, name='game_settings_api'),
    path('match_history/', match_history_api, name='match_history_api'),
    path('match_history/list/', match_history_list, name='match_history_list'),
    path('match_history/all/', match_history_all, name='match_history_all'),
    path('leaderboard/', leaderboard, name='leaderboard'),
    path('user_stats/', user_stats, name='user_stats'),
]
