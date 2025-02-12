import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Tournoi, Joueur

@csrf_exempt
def tournament(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            tournoi_nom = data.get("name", "").strip()
            joueurs = [j.strip() for j in data.get("players", [])]

            # Vérifier que le nom du tournoi est valide
            if not tournoi_nom:
                return JsonResponse({"error": "Le nom du tournoi est requis."}, status=400)

            # Vérifier si le tournoi existe déjà
            if Tournoi.objects.filter(nom=tournoi_nom).exists():
                return JsonResponse({"error": "Un tournoi avec ce nom existe déjà."}, status=400)

            # Vérifier qu'il y a assez de joueurs
            if len(joueurs) < 2:
                return JsonResponse({"error": "Il faut au moins 2 joueurs."}, status=400)

            # Vérifier que tous les pseudos sont uniques
            if len(joueurs) != len(set(joueurs)):
                return JsonResponse({"error": "Les pseudos doivent être uniques."}, status=400)

            # Création du tournoi
            tournoi = Tournoi.objects.create(nom=tournoi_nom)

            # Ajout des joueurs
            for pseudo in joueurs:
                Joueur.objects.create(pseudo=pseudo, tournoi=tournoi)

            return JsonResponse({"message": "Tournoi créé avec succès", "id": tournoi.id})

        except json.JSONDecodeError:
            return JsonResponse({"error": "Format JSON invalide."}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Méthode non autorisée"}, status=405)

