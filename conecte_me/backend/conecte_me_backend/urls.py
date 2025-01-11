from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/42/', include('oauth_app.urls')),  # Routes d’auth OAuth 42
]
