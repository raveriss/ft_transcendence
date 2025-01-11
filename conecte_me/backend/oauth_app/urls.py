from django.urls import path
from django.http import HttpResponse  # Import de HttpResponse
from .views import redirect_to_42, callback_42

def login_view(request):
    return HttpResponse("Login page")

urlpatterns = [
    path('login/', redirect_to_42, name='redirect_to_42'),
    path('callback', callback_42, name='callback_42'),
]
