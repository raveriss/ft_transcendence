from django.test import TestCase
from django.urls import reverse
from oauth_app.models import User42

class OAuthFlowTest(TestCase):
    def test_redirect_to_42(self):
        url = reverse('redirect_to_42')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 302)
        self.assertIn("api.intra.42.fr/oauth/authorize", response.url)

class SignupViewTestCase(TestCase):
    def setUp(self):
        self.signup_url = reverse('signup')

    def test_signup_success(self):
        response = self.client.post(self.signup_url, {
            'firstname': 'John',
            'email': 'john.doe@example.com',
            'password': 'StrongP@ssw0rd!',
            'pseudo': 'johndoe'
        })
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json().get('success'), True)
        self.assertEqual(User42.objects.count(), 1)
        self.assertEqual(User42.objects.first().email_address, 'john.doe@example.com')

    def test_signup_email_already_exists(self):
        User42.objects.create(
            user_id=1, 
            username='existinguser',
            first_name='Existing', 
            email_address='existing@example.com', 
            password='hashed_password'
        )
        response = self.client.post(self.signup_url, {
            'firstname': 'John',
            'email': 'existing@example.com',
            'password': 'StrongP@ssw0rd!',
            'pseudo': 'johndoe'
        })
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json().get('error'), "Cette adresse e-mail est déjà utilisée.")
        self.assertEqual(User42.objects.count(), 1)

    def test_signup_missing_fields(self):
        response = self.client.post(self.signup_url, {
            'firstname': '',
            'email': '',
            'password': ''
        })
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.json())

def test_signup_stores_data_in_db(self):
    response = self.client.post(self.signup_url, {
        'firstname': 'Alice',
        'email': 'alice@example.com',
        'password': 'ValidP@ss123',
        'pseudo': 'alice123'
    })
    self.assertEqual(response.status_code, 201)
    user = User42.objects.get(email_address='alice@example.com')
    self.assertEqual(user.first_name, 'Alice')
    self.assertTrue(user.password.startswith('pbkdf2_sha256$'))  # Vérifie que le mot de passe est haché