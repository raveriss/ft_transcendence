from django.urls import path
from django.http import HttpResponse  # Import de HttpResponse
from .views import redirect_to_42, callback_42
from . import views
from . import twofa_views

urlpatterns = [
    path('signup/', views.signup_view, name='signup'),
    path('login/', views.login_view, name='login'),
    path('login-42/', redirect_to_42, name='redirect_to_42'),
    path('callback', callback_42, name='callback_42'),

    # Endpoints 2FA
    path('2fa/setup/', twofa_views.two_factor_setup, name='two_factor_setup'),
    path('2fa/validate/', twofa_views.two_factor_validate, name='two_factor_validate'),

]
