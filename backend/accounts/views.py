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

from .models import Appointment # Certifique-se de que o model existe

class PsicologoAgendaView(APIView):
    permission_classes = [IsAuthenticated]

    # O psicólogo vê a agenda dele (quem marcou e horários livres)
    def get(self, request):
        # Filtra agendamentos onde o psicólogo é o usuário logado
        agenda = Appointment.objects.filter(psicologo=request.user).order_by('date', 'horario')
        
        # Formata os dados para o frontend
        dados = []
        for item in agenda:
            dados.append({
                'id': item.id,
                'paciente': item.paciente.username if item.paciente else "Livre",
                'date': item.date,
                'horario': item.horario.strftime('%H:%M'),
                'status': item.status
            })
        return Response(dados)

    # O psicólogo cria novos horários disponíveis
    def post(self, request):
        data_consulta = request.data.get('date')
        slots = request.data.get('slots') # Lista de horários: ['08:00', '09:00']

        if not data_consulta or not slots:
            return Response({'erro': 'Data e horários são obrigatórios.'}, status=400)

        for hora in slots:
            # get_or_create evita duplicar o mesmo horário no mesmo dia
            Appointment.objects.get_or_create(
                psicologo=request.user,
                date=data_consulta,
                horario=hora,
                defaults={'status': 'disponivel'}
            )

        return Response({'mensagem': 'Agenda atualizada com sucesso!'}, status=201)


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
        data = request.data
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        # Garante que is_psicologo seja convertido para booleano real
        is_psicologo = str(data.get('is_psicologo', '')).lower() == 'true' or data.get('is_psicologo') == True

        # ... (suas validações de senha aqui)

        # Criação do usuário forçando o is_staff
        User.objects.create_user(
            username=username, 
            password=password, 
            email=data.get('email', '').strip(),
            is_staff=is_psicologo # O Django usa is_staff para permissões de equipe
        )

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

            # Para testes/desenvolvimento
            if settings.DEBUG:
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

    def patch(self, request):
        user = request.user
        email = request.data.get('email')
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')

        if email is not None:
            normalized_email = email.strip()
            if normalized_email and User.objects.filter(email__iexact=normalized_email).exclude(pk=user.pk).exists():
                return Response({'erro': 'Este email ja esta em uso.'}, status=status.HTTP_400_BAD_REQUEST)
            user.email = normalized_email

        if first_name is not None:
            user.first_name = first_name.strip()

        if last_name is not None:
            user.last_name = last_name.strip()

        user.save(update_fields=['email', 'first_name', 'last_name'])

        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
