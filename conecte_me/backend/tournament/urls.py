from django.urls import path
from .views import tournament

urlpatterns = [
    path("tournament", tournament, name="tournament"),
]

