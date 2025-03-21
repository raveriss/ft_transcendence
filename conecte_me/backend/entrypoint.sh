#!/bin/sh
set -e

echo "🚀 Démarrage du backend..."

# Attente de la base de données PostgreSQL
echo "⏳ Attente de la disponibilité de la base de données..."
max_retries=20
retries=0
until python manage.py shell -c "from django.contrib.sessions.models import Session; print('OK')" 2>/dev/null; do
    retries=$((retries+1))
    if [ $retries -ge $max_retries ]; then
        echo "❌ La base de données n'est pas disponible après $retries tentatives."
        exit 1
    fi
    echo "⚠️ Base de données non disponible, tentative $retries/$max_retries..."
    sleep 5
done
echo "✅ La base de données est disponible."

# Attente de Redis (nécessaire pour Django Channels)
echo "⏳ Attente de Redis..."
while ! nc -z "$REDIS_HOST" "$REDIS_PORT"; do
  sleep 1
done
echo "✅ Redis est prêt !"

# Génération et application des migrations
echo "⚙️ Génération des migrations pour l'app 'game'..."
python manage.py makemigrations game --noinput

echo "⚙️ Application des migrations pour l'app 'game'..."
python manage.py migrate game --noinput

echo "⚙️ Application de toutes les migrations restantes..."
python manage.py migrate --noinput

echo "✅ Migrations appliquées automatiquement."

# Collecte des fichiers statiques pour éviter les erreurs de fichiers statiques en production
echo "📦 Collecte des fichiers statiques..."
python manage.py collectstatic --noinput

# Lancement du serveur avec Daphne
echo "🚀 Lancement du serveur Daphne..."
exec daphne -b 0.0.0.0 -p 8000 conecte_me_backend.asgi:application
