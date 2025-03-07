import json
import logging
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

# Récupérer le logger dédié aux logs frontend
frontend_logger = logging.getLogger("frontend")

@csrf_exempt
def receive_frontend_log(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "JSON invalide"}, status=400)

        # Ajouter un champ pour identifier la source du log (optionnel)
        data["source"] = "frontend"

        # Loguer le message sous forme de chaîne JSON
        frontend_logger.info(json.dumps(data))
        return JsonResponse({"status": "ok"})
    else:
        return JsonResponse({"error": "Méthode non autorisée"}, status=405)
