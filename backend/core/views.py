import random
from datetime import date

from django.db.models.functions import Random
from django.http import JsonResponse
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Appointment, RelatoCaso, UserProfile
from .serializers import AppointmentSerializer, RelatoCasoSerializer, UserProfileSerializer


def relato_do_dia(request):
    hoje = date.today()
    total = RelatoCaso.objects.count()

    if total == 0:
        return JsonResponse({"mensagem": "Nenhum relato disponivel"}, status=404)

    random.seed(hoje.toordinal())
    idx = random.randrange(total)
    relato = RelatoCaso.objects.all().order_by("id")[idx]

    return JsonResponse(formatar_relato(relato, hoje))


def formatar_relato(relato, hoje):
    return {
        "id": relato.id,
        "titulo": relato.titulo,
        "subtitulo": relato.subtitulo,
        "conteudo": relato.texto,
        "fonte": getattr(relato, "fonte", None),
        "data": str(hoje),
    }


def relato_aleatorio(request):
    relato = RelatoCaso.objects.order_by(Random()).first()

    if not relato:
        return JsonResponse({"mensagem": "Nenhum relato disponivel"}, status=404)

    return JsonResponse({
        "id": relato.id,
        "titulo": relato.titulo,
        "subtitulo": relato.subtitulo,
        "conteudo": relato.texto,
    })


class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Appointment.objects.filter(user=self.request.user).order_by("-date")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=["get"])
    def pending(self, request):
        appointments = self.get_queryset().filter(
            status__in=[Appointment.STATUS_SCHEDULED, Appointment.STATUS_PENDING]
        ).order_by("date")

        serializer = self.get_serializer(appointments, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def completed(self, request):
        appointments = self.get_queryset().filter(
            status=Appointment.STATUS_COMPLETED
        ).order_by("-date")

        serializer = self.get_serializer(appointments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def mark_completed(self, request, pk=None):
        appointment = self.get_object()
        appointment.mark_completed()

        serializer = self.get_serializer(appointment)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="occupied-slots")
    def occupied_slots(self, request):
        profissional = request.query_params.get("profissional", "").strip()

        if not profissional:
            return Response(
                {"erro": 'O parametro "profissional" e obrigatorio.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        occupied = Appointment.objects.filter(
            profissional=profissional
        ).filter(
            status__in=[Appointment.STATUS_SCHEDULED, Appointment.STATUS_PENDING]
        ).order_by("date", "horario")

        data = [
            {"date": str(a.date), "horario": a.horario.strftime("%H:%M")}
            for a in occupied
        ]

        return Response(data)

    @action(detail=False, methods=["delete"], url_path="clear-completed")
    def clear_completed(self, request):
        deleted_count, _ = Appointment.objects.filter(
            user=request.user,
            status=Appointment.STATUS_COMPLETED,
        ).delete()

        return Response({"deleted": deleted_count}, status=status.HTTP_200_OK)


class UserProfileViewSet(viewsets.ModelViewSet):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return UserProfile.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=["get"])
    def me(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)

        serializer = self.get_serializer(profile)
        return Response(serializer.data)
