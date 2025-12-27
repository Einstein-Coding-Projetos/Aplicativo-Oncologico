import random
from datetime import date
from django.http import JsonResponse
from .models import RelatoCaso

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
