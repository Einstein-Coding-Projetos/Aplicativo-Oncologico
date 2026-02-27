from django.contrib.auth.models import User
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase


class AccountsApiTests(APITestCase):
    def register(self, username, password):
        payload = {
            'username': username,
            'password': password,
            'email': f'{username}@example.com',
        }
        return self.client.post('/api/accounts/register/', payload, format='json')

    def test_register_creates_user(self):
        response = self.register('novo_usuario', 'SenhaForte123!')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='novo_usuario').exists())

    def test_register_rejects_password_shorter_than_8_chars(self):
        response = self.register('shortpwd', 'Aa1!')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('minimo 8', response.data['erro'])

    def test_register_rejects_password_without_uppercase(self):
        response = self.register('noupper', 'senhaforte123!')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('maiuscula', response.data['erro'])

    def test_register_rejects_password_without_lowercase(self):
        response = self.register('nolower', 'SENHAFORTE123!')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('minuscula', response.data['erro'])

    def test_register_rejects_password_without_number(self):
        response = self.register('nonumber', 'SenhaForte!!!')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('numero', response.data['erro'])

    def test_register_rejects_password_without_special_char(self):
        response = self.register('nospecial', 'SenhaForte123')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('especial', response.data['erro'])

    def test_me_requires_authentication(self):
        response = self.client.get('/api/accounts/me/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_returns_authenticated_user(self):
        user = User.objects.create_user(username='alice', password='SenhaForte123!')
        self.client.force_authenticate(user=user)

        response = self.client.get('/api/accounts/me/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'alice')

    def test_forgot_password_returns_generic_message_for_unknown_email(self):
        response = self.client.post('/api/accounts/forgot-password/', {'email': 'naoexiste@example.com'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('mensagem', response.data)
        self.assertNotIn('token', response.data)

    @override_settings(EXPOSE_PASSWORD_RESET_TOKEN=True)
    def test_forgot_password_returns_uid_and_token_for_known_email_in_debug(self):
        User.objects.create_user(username='carlos', password='SenhaForte123!', email='carlos@example.com')

        response = self.client.post('/api/accounts/forgot-password/', {'email': 'carlos@example.com'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('uid', response.data)
        self.assertIn('token', response.data)

    def test_reset_password_success(self):
        user = User.objects.create_user(username='maria', password='SenhaForte123!', email='maria@example.com')
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = PasswordResetTokenGenerator().make_token(user)

        response = self.client.post(
            '/api/accounts/reset-password/',
            {'uid': uid, 'token': token, 'new_password': 'NovaSenha123!'},
            format='json',
        )

        user.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(user.check_password('NovaSenha123!'))

    def test_reset_password_rejects_invalid_token(self):
        user = User.objects.create_user(username='joana', password='SenhaForte123!', email='joana@example.com')
        uid = urlsafe_base64_encode(force_bytes(user.pk))

        response = self.client.post(
            '/api/accounts/reset-password/',
            {'uid': uid, 'token': 'token-invalido', 'new_password': 'NovaSenha123!'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reset_password_enforces_strength_rules(self):
        user = User.objects.create_user(username='lucas', password='SenhaForte123!', email='lucas@example.com')
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = PasswordResetTokenGenerator().make_token(user)

        response = self.client.post(
            '/api/accounts/reset-password/',
            {'uid': uid, 'token': token, 'new_password': 'fraca'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('minimo 8', response.data['erro'])
