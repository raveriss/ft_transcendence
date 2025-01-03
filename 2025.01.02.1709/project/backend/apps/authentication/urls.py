from django.urls import path
from . import views

urlpatterns = [
    path('auth/42/callback/', views.oauth_callback, name='oauth-callback'),
]