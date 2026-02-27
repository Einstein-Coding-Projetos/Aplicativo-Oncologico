from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from core.models import Appointment


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def agendar(request):
    if request.method == 'GET':
        consultas = Appointment.objects.filter(user=request.user).order_by('date')
        lista = [
            {
                "id": a.id,
                "profissional": a.profissional,
                "date": str(a.date),
                "horario": a.horario,
                "status": a.status,
            }
            for a in consultas
        ]
        return Response(lista)

    # POST
    profissional = request.data.get('psicologo')
    dia = request.data.get('dia')
    horario = request.data.get('horario')

    if not all([profissional, dia, horario]):
        return Response(
            {'erro': 'Os campos psicologo, dia e horario são obrigatórios.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    appointment = Appointment.objects.create(
        user=request.user,
        profissional=profissional,
        date=dia,
        horario=horario,
        status=Appointment.STATUS_SCHEDULED,
    )

    return Response(
        {
            "id": appointment.id,
            "profissional": appointment.profissional,
            "date": str(appointment.date),
            "horario": appointment.horario,
            "status": appointment.status,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(['PUT', 'POST'])
@permission_classes([IsAuthenticated])
def concluir_consulta(request, id_consulta):
    appointment = get_object_or_404(Appointment, id=id_consulta, user=request.user)
    appointment.mark_completed()
    return Response({'status': 'Atualizado com sucesso'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def consultas_concluidas(request):
    consultas = Appointment.objects.filter(
        user=request.user,
        status=Appointment.STATUS_COMPLETED,
    ).order_by('-date')

    lista = [
        {
            "id": a.id,
            "profissional": a.profissional,
            "date": str(a.date),
            "horario": a.horario,
            "status": a.status,
        }
        for a in consultas
    ]
    return Response(lista)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def horarios_ocupados(request, nome_profissional):
    # Not filtered by user — needs all bookings for this professional
    # so the frontend can block already-taken slots.
    consultas = Appointment.objects.filter(profissional=nome_profissional)
    lista = [
        {"date": str(a.date), "horario": a.horario}
        for a in consultas
    ]
    return Response(lista)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def limpar_historico(request):
    Appointment.objects.filter(
        user=request.user,
        status=Appointment.STATUS_COMPLETED,
    ).delete()
    return Response({'mensagem': 'Histórico limpo com sucesso!'})
