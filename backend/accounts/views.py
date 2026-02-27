import re

from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import UserSerializer


def validate_password_strength(password: str):
    if len(password) < 8:
        return 'A senha deve ter no minimo 8 caracteres.'
    if not re.search(r'[A-Z]', password):
        return 'A senha deve conter pelo menos 1 letra maiuscula.'
    if not re.search(r'[a-z]', password):
        return 'A senha deve conter pelo menos 1 letra minuscula.'
    if not re.search(r'\d', password):
        return 'A senha deve conter pelo menos 1 numero.'
    if not re.search(r'[^A-Za-z0-9]', password):
        return 'A senha deve conter pelo menos 1 caractere especial.'
    return None


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '')
        email = request.data.get('email', '').strip()

        if not username or not password:
            return Response(
                {'erro': 'Username e password sao obrigatorios.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {'erro': 'Este username ja esta em uso.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        password_error = validate_password_strength(password)
        if password_error:
            return Response(
                {'erro': password_error},
                status=status.HTTP_400_BAD_REQUEST,
            )

        User.objects.create_user(username=username, password=password, email=email)
        return Response({'mensagem': 'Conta criada com sucesso!'}, status=status.HTTP_201_CREATED)


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip()
        if not email:
            return Response(
                {'erro': 'Email e obrigatorio.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.filter(email__iexact=email).first()
        payload = {'mensagem': 'Se o email existir, voce recebera instrucoes para redefinir a senha.'}

        if user:
            generator = PasswordResetTokenGenerator()
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = generator.make_token(user)

            # Dev-only helper for mobile app/manual testing without email provider.
            if settings.DEBUG or getattr(settings, 'EXPOSE_PASSWORD_RESET_TOKEN', False):
                payload['uid'] = uid
                payload['token'] = token

        return Response(payload, status=status.HTTP_200_OK)


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        uid = request.data.get('uid', '').strip()
        token = request.data.get('token', '').strip()
        new_password = request.data.get('new_password', '')

        if not uid or not token or not new_password:
            return Response(
                {'erro': 'uid, token e new_password sao obrigatorios.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        password_error = validate_password_strength(new_password)
        if password_error:
            return Response(
                {'erro': password_error},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({'erro': 'Token de recuperacao invalido.'}, status=status.HTTP_400_BAD_REQUEST)

        generator = PasswordResetTokenGenerator()
        if not generator.check_token(user, token):
            return Response({'erro': 'Token de recuperacao invalido.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save(update_fields=['password'])

        return Response({'mensagem': 'Senha redefinida com sucesso.'}, status=status.HTTP_200_OK)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
