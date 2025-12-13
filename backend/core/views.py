import random
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import RelatoCaso
from .serializers import RelatoCasoSerializer

@api_view(["GET"])
def relato_aleatorio(request):
    relatos_disponiveis = RelatoCaso.objects.filter(
        ativo=True,
        ja_exibido=False
    )

    if not relatos_disponiveis.exists():
        RelatoCaso.objects.filter(ativo=True).update(ja_exibido=False)
        relatos_disponiveis = RelatoCaso.objects.filter(
            ativo=True,
            ja_exibido=False
        )

    relato = random.choice(list(relatos_disponiveis))
    relato.ja_exibido = True
    relato.save()

    serializer = RelatoCasoSerializer(relato)
    return Response(serializer.data)
