from django.test import TestCase
from django.urls import reverse

class OAuthFlowTest(TestCase):
    def test_redirect_to_42(self):
        url = reverse('redirect_to_42')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 302)
        self.assertIn("api.intra.42.fr/oauth/authorize", response.url)
