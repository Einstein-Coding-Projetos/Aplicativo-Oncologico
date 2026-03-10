import random
from datetime import date
from django.http import JsonResponse
from .models import RelatoCaso


def relato_do_dia(request):
    hoje = date.today()

    # 1️⃣ Já existe relato exibido hoje?
    relato_hoje = RelatoCaso.objects.filter(exibido_em=hoje).first()
    if relato_hoje:
        return JsonResponse(formatar_relato(relato_hoje))

    # 2️⃣ Relatos ativos que ainda não foram exibidos
    disponiveis = list(
        RelatoCaso.objects.filter(ativo=True, exibido_em__isnull=True)
    )

    # 3️⃣ Se todos já foram exibidos, resetar ciclo
    if not disponiveis:
        RelatoCaso.objects.filter(ativo=True).update(exibido_em=None)
        disponiveis = list(RelatoCaso.objects.filter(ativo=True))

    # 4️⃣ Sorteio
    relato = random.choice(disponiveis)
    relato.exibido_em = hoje
    relato.save(update_fields=["exibido_em"])

    return JsonResponse(formatar_relato(relato))


def formatar_relato(relato):
    return {
        "id": relato.id,
        "titulo": relato.titulo,
        "subtitulo": relato.subtitulo,
        "texto": relato.texto,
        "fonte": relato.fonte,
        "data": str(relato.exibido_em),
    }
