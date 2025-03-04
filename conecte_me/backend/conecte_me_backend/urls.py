from django.contrib import admin
from django.urls import path, include
from oauth_app import views  # Remplacez par le nom correct de l'application contenant la vue
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/', include('oauth_app.urls')),  # Toutes les routes d’authentification et 2FA
    path('auth/42/', include('oauth_app.urls')),  # Routes d’auth OAuth 42
    path('auth/signup/', views.signup_view, name='signup'),  # Ajoutez cette ligne
    
    # AJOUTER la ligne ci-dessous (ou le merge dans votre existant):
    path('auth/login/', views.login_view, name='login'),     # /auth/login/
    # path('api/', include('oauth_app.urls')),  # ✅ Assure l'accès aux routes API
]

# Ajout de la configuration pour servir les fichiers médias en développement
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)