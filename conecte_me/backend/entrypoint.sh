#!/bin/sh
set -e

echo "Attente de la disponibilité de la base de données..."
max_retries=20
retries=0
until python manage.py shell -c "from django.contrib.sessions.models import Session; print('OK')" 2>/dev/null; do
    retries=$((retries+1))
    if [ $retries -ge $max_retries ]; then
        echo "La base de données n'est pas disponible après $retries tentatives."
        exit 1
    fi
    echo "Base de données non disponible, tentative $retries/$max_retries..."
    sleep 5
done

echo "La base de données est disponible."

echo "Génération des migrations pour l'app 'game'..."
python manage.py makemigrations game --noinput

echo "Application des migrations pour l'app 'game'..."
python manage.py migrate game --noinput

echo "Application de toutes les migrations restantes..."
python manage.py migrate --noinput

echo "Migrations appliquées automatiquement."

echo "Lancement du serveur Daphne..."
daphne -b 0.0.0.0 -p 8000 conecte_me_backend.asgi:application
