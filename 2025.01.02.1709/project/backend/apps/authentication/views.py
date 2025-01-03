from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.conf import settings
import requests
from .models import User
from .serializers import UserSerializer
from rest_framework_simplejwt.tokens import RefreshToken

@api_view(['GET'])
@permission_classes([AllowAny])
def oauth_callback(request):
    code = request.GET.get('code')
    if not code:
        return Response({'error': 'No code provided'}, status=status.HTTP_400_BAD_REQUEST)

    # Exchange code for access token
    token_url = 'https://api.intra.42.fr/oauth/token'
    data = {
        'grant_type': 'authorization_code',
        'client_id': settings.FORTYTWO_CLIENT_ID,
        'client_secret': settings.FORTYTWO_CLIENT_SECRET,
        'code': code,
        'redirect_uri': settings.FORTYTWO_REDIRECT_URI
    }
    
    token_response = requests.post(token_url, data=data)
    if token_response.status_code != 200:
        return Response({'error': 'Failed to obtain access token'}, 
                      status=status.HTTP_400_BAD_REQUEST)

    access_token = token_response.json().get('access_token')

    # Get user info from 42 API
    user_url = 'https://api.intra.42.fr/v2/me'
    headers = {'Authorization': f'Bearer {access_token}'}
    user_response = requests.get(user_url, headers=headers)
    
    if user_response.status_code != 200:
        return Response({'error': 'Failed to get user info'}, 
                      status=status.HTTP_400_BAD_REQUEST)

    user_data = user_response.json()

    # Create or update user
    try:
        user = User.objects.get(fortytwo_id=str(user_data['id']))
    except User.DoesNotExist:
        user = User.objects.create(
            username=user_data['login'],
            email=user_data['email'],
            fortytwo_id=str(user_data['id']),
            avatar_url=user_data['image']['link']
        )

    # Generate JWT tokens
    refresh = RefreshToken.for_user(user)
    tokens = {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

    return Response({
        'user': UserSerializer(user).data,
        'tokens': tokens
    })