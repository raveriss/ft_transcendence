from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.create_tournament, name='create_tournament'),
    path('<int:tournament_id>/', views.tournament_details, name='tournament_details'),
    path('<int:tournament_id>/play_next/', views.play_next_match, name='play_next_match'),
]
