from django.contrib import admin
from django.urls import path, include
from oauth_app import views  # Remplacez par le nom correct de l'application contenant la vue


urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/42/', include('oauth_app.urls')),  # Routes d’auth OAuth 42
    path('auth/signup/', views.signup_view, name='signup'),  # Ajoutez cette ligne
    
    # AJOUTER la ligne ci-dessous (ou le merge dans votre existant):
    path('auth/login/', views.login_view, name='login'),     # /auth/login/
]
