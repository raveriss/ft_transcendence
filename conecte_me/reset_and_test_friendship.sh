#!/bin/bash

echo "🧹 Suppression des anciens utilisateurs et relations..."
docker-compose exec -T backend python manage.py shell << EOF
from oauth_app.models import User42, Friendship
from django.contrib.auth.hashers import make_password

Friendship.objects.all().delete()
User42.objects.all().delete()

user1 = User42.objects.create(
    user_id=0,
    username="alice",
    email_address="alice@example.com",
    first_name="Alice",
    password=make_password("alicepass")
)

user2 = User42.objects.create(
    user_id=1,
    username="bob",
    email_address="bob@example.com",
    first_name="Bob",
    password=make_password("bobpass")
)

print("👤 Utilisateurs créés :")
print(User42.objects.all())
EOF

echo "🔐 Connexion de alice..."
curl -k -s -X POST https://localhost:8443/auth/login/ \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -c cookies_user1.txt \
  -d "email=alice@example.com&password=alicepass"

echo -e "\n🔐 Connexion de bob..."
curl -k -s -X POST https://localhost:8443/auth/login/ \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -c cookies_user2.txt \
  -d "email=bob@example.com&password=bobpass"

echo -e "\n🔎 Recherche d'utilisateur contenant 'bo' par alice..."
curl -k -s -X GET "https://localhost:8443/auth/42/users/search/?q=bo" \
  -b cookies_user1.txt | jq

echo -e "\n📤 alice envoie une demande d'ami à bob..."
curl -k -s -X POST https://localhost:8443/auth/42/friends/request/ \
  -H "Content-Type: application/json" \
  -b cookies_user1.txt \
  -d '{"target_id": 1}' | jq

echo -e "\n📥 bob consulte ses demandes d'amis entrantes..."
curl -k -s -X GET https://localhost:8443/auth/42/friends/incoming/ \
  -b cookies_user2.txt | jq

echo -e "\n❌ bob refuse la demande d'ami..."
curl -k -s -X POST https://localhost:8443/auth/42/friends/remove/ \
  -H "Content-Type: application/json" \
  -b cookies_user2.txt \
  -d '{"target_id": 0}' | jq

echo -e "\n📤 alice renvoie une nouvelle demande..."
curl -k -s -X POST https://localhost:8443/auth/42/friends/request/ \
  -H "Content-Type: application/json" \
  -b cookies_user1.txt \
  -d '{"target_id": 1}' | jq

echo -e "\n📥 bob revoit ses demandes entrantes..."
curl -k -s -X GET https://localhost:8443/auth/42/friends/incoming/ \
  -b cookies_user2.txt | jq

echo -e "\n✅ bob accepte la demande cette fois..."
curl -k -s -X POST https://localhost:8443/auth/42/friends/accept/ \
  -H "Content-Type: application/json" \
  -b cookies_user2.txt \
  -d '{"sender_id": 0}' | jq

echo -e "\n🗑️ alice supprime bob de ses amis..."
curl -k -s -X POST https://localhost:8443/auth/42/friends/remove/ \
  -H "Content-Type: application/json" \
  -b cookies_user1.txt \
  -d '{"target_id": 1}' | jq

echo -e "\n📋 Vérification finale dans Django..."
docker-compose exec -T backend python manage.py shell << EOF
from oauth_app.models import User42
alice = User42.objects.get(username="alice")
bob = User42.objects.get(username="bob")
print("👥 Amis de alice:", list(alice.get_friends()))
print("👥 Amis de bob:", list(bob.get_friends()))
EOF
