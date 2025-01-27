from django.urls import path
from django.http import HttpResponse  # Import de HttpResponse
from .views import redirect_to_42, callback_42
from . import views


def login_view(request):
    return HttpResponse("Login page")

urlpatterns = [
    path('signup/', views.signup_view, name='signup'),
    path('login-42/', redirect_to_42, name='redirect_to_42'),
    path('callback', callback_42, name='callback_42'),
]
