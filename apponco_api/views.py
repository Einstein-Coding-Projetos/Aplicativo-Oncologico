from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
import json

# @csrf_exempt é OBRIGATÓRIO aqui para o React Native conseguir acessar
# sem precisar de um token de segurança complexo (usar só em desenvolvimento!)
@csrf_exempt
def agendar(request):
    if request.method == 'POST':
        try:
            # 1. Pega os dados que vieram do App
            dados = json.loads(request.body)
            print("PEDIDO RECEBIDO:", dados) # Vai aparecer no terminal do Python

            # 2. Prepara os dados
            psicologo = dados.get('psicologo')
            dia = dados.get('dia')
            horario = dados.get('horario')

            # 3. Executa o SQL direto no banco
            with connection.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO agendamentos (nome_psicologo, dia, horario) VALUES (%s, %s, %s)",
                    [psicologo, dia, horario]
                )

            return JsonResponse({'mensagem': 'Agendado com sucesso!'}, status=201)

        except Exception as e:
            print("ERRO:", e)
            return JsonResponse({'erro': str(e)}, status=500)

    return JsonResponse({'erro': 'Método não permitido'}, status=405)