import json
import logging
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

frontend_logger = logging.getLogger("frontend")

@csrf_exempt
def receive_frontend_log(request):
    if request.method == "OPTIONS":
        response = JsonResponse({'status': 'ok'})
        response['Access-Control-Allow-Origin'] = '*'  # À restreindre selon vos besoins
        response['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type'
        return response
    elif request.method == "POST":
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "JSON invalide"}, status=400)

        # Vous pouvez ajouter un champ complémentaire sans écraser le "source" envoyé
        data["origin"] = "frontend"  # Si vous souhaitez indiquer que c'est un log frontend
        frontend_logger.info(json.dumps(data))
        response = JsonResponse({"status": "ok"})
        response['Access-Control-Allow-Origin'] = '*'  # En cas de requête cross-domain
        return response
    else:
        return JsonResponse({"error": "Méthode non autorisée"}, status=405)
