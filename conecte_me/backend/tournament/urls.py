from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.create_tournament, name='create_tournament'),
    # path('<int:tournament_id>/details/', views.tournament_details, name='tournament_details'),
    path('<int:tournament_id>/play_next/', views.play_next_match, name='play_next_match'),
	# path('api/<int:tournament_id>/', views.get_tournament_details, name='get_tournament_details'),
	# path('api/<int:tournament_id>/', views.get_tournament_details, name='tournament_details_json'),
	path('api/details/<int:tournament_id>/', views.get_tournament_details, name='tournament_api_details'),
	path('<int:tournament_id>/match/<int:match_id>/finish/', views.finish_match, name='finish_match'),
	path("get_current_id/", views.get_current_tournament_id, name="get_current_tournament_id"),
]
