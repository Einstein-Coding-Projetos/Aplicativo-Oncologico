import random
from datetime import date
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import RelatoCaso, Appointment, UserProfile
from .serializers import RelatoCasoSerializer, AppointmentSerializer, UserProfileSerializer

def relato_do_dia(request):
    hoje = date.today()

    # 1️⃣ Já existe relato escolhido hoje?
    relato_hoje = RelatoCaso.objects.filter(
        ativo=True,
        exibido_em=hoje
    ).first()

    if relato_hoje:
        return JsonResponse({
            "id": relato_hoje.id,
            "titulo": relato_hoje.titulo,
            "subtitulo": relato_hoje.subtitulo,
            "texto": relato_hoje.texto,
            "data": str(hoje),
        })

    # 2️⃣ Se não, escolhe um novo
    relatos_disponiveis = RelatoCaso.objects.filter(
        ativo=True
    )

    if not relatos_disponiveis.exists():
        return JsonResponse(
            {"mensagem": "Nenhum relato disponível"},
            status=404
        )

    relato = random.choice(list(relatos_disponiveis))

    relato.exibido_em = hoje
    relato.save()

    return JsonResponse({
        "id": relato.id,
        "titulo": relato.titulo,
        "subtitulo": relato.subtitulo,
        "texto": relato.texto,
        "data": str(hoje),
    })

def relato_aleatorio(request):
    relatos = RelatoCaso.objects.filter(ativo=True)
    if not relatos.exists():
        return JsonResponse({'mensagem': 'Nenhum relato disponível'}, status=404)
    relato = random.choice(list(relatos))
    return JsonResponse({
        'id': relato.id,
        'titulo': relato.titulo,
        'subtitulo': relato.subtitulo,
        'texto': relato.texto,
    })

class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all().order_by('-date')
    serializer_class = AppointmentSerializer
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get all pending appointments (not completed)"""
        appointments = Appointment.objects.exclude(status=Appointment.STATUS_COMPLETED).order_by('date')
        serializer = self.get_serializer(appointments, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_completed(self, request, pk=None):
        """Mark an appointment as completed"""
        appointment = self.get_object()
        appointment.mark_completed()
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get the current authenticated user's profile"""
        try:
            profile = UserProfile.objects.get(user=request.user)
        except UserProfile.DoesNotExist:
            # Create profile if it doesn't exist
            profile = UserProfile.objects.create(user=request.user)
        
        serializer = self.get_serializer(profile)
        return Response(serializer.data)
