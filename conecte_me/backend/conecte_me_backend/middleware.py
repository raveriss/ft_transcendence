from django.shortcuts import redirect

class AuthenticationRequiredMiddleware:
    """
    Ce middleware redirige vers /home les requêtes vers des pages protégées
    si l'utilisateur n'est pas authentifié.
    """
    def __init__(self, get_response):
        self.get_response = get_response
        # Définir ici les URL à protéger
        self.protected_paths = ['/board', '/user', '/stats', '/setup']

    def __call__(self, request):
        if request.path in self.protected_paths:
            if not request.session.get('user_id'):
                return redirect('/home')
        response = self.get_response(request)
        return response
