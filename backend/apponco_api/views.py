from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
import json

# @csrf_exempt é OBRIGATÓRIO aqui para o React Native conseguir acessar
# sem precisar de um token de segurança complexo (usar só em desenvolvimento!)
@csrf_exempt
def agendar(request):
    if request.method == 'GET':
        try:
            with connection.cursor() as cursor:
                # Busca tudo da tabela alunos
                cursor.execute("SELECT id, profissional, date, hora, status FROM alunos ORDER BY date ASC")
                rows = cursor.fetchall()
                
                lista_consultas = []
                for row in rows:
                    lista_consultas.append({
                        "id": row[0],
                        "profissional": row[1],
                        "date": str(row[2]), # Converte data para texto
                        "horario": row[3],
                        "status": row[4]
                    })
                
            # Retorna a lista como JSON para o App
            return JsonResponse(lista_consultas, safe=False)
        except Exception as e:
            return JsonResponse({'erro': str(e)}, status=500)
    
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
                    "INSERT INTO alunos (profissional, date, hora, status) VALUES ( %s, %s, %s, %s)",
                    [psicologo, dia, horario, 'agendado']
                )

            return JsonResponse({'mensagem': 'Agendado com sucesso!'}, status=201)

        except Exception as e:
            print("ERRO:", e)
            return JsonResponse({'erro': str(e)}, status=500)

    return JsonResponse({'erro': 'Método não permitido'}, status=405)

@csrf_exempt
def consultas_agendadas (request):
    if request.method == 'GET':
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT id, profissional, date, hora, status FROM alunos WHERE status = 'agendado' ORDER BY date ASC")
                rows = cursor.fetchall()
                
                lista_agendadas = []
                for row in rows:
                    lista_agendadas.append({
                        "id": row[0],
                        "profissional": row[1],
                        "date": str(row[2]), 
                        "horario": row[3],
                        "status": row[4]
                    })
                
            # Retorna a lista como JSON para o App
            return JsonResponse(lista_agendadas, safe=False)
        
        except Exception as e:
            return JsonResponse({'erro': str(e)}, status=500)
        
    return JsonResponse({'erro': 'Apenas GET permitido'}, status=405)


@csrf_exempt
def concluir_consulta(request, id_consulta):
    if request.method == 'PUT' or request.method == 'POST':
        try:
            with connection.cursor() as cursor:
                cursor.execute("UPDATE alunos SET status = 'concluido' WHERE id = %s", [id_consulta])
            return JsonResponse({'status': 'Atualizado com sucesso'})
        except Exception as e:
            return JsonResponse({'erro': str(e)}, status=500)
            
    return JsonResponse({'erro': 'Método inválido'}, status=405)

# Coloque isso no final do arquivo views.py

@csrf_exempt
def consultas_concluidas(request):
    if request.method == 'GET':
        try:
            with connection.cursor() as cursor:
                # Busca apenas as concluídas, ordenando da mais recente para a mais antiga
                cursor.execute("SELECT id, profissional, date, hora, status FROM alunos WHERE status = 'concluido' ORDER BY date DESC")
                rows = cursor.fetchall()
            
            lista_concluidas = []
            for row in rows:
                lista_concluidas.append({
                    "id": row[0],
                    "profissional": row[1],
                    "date": str(row[2]),
                    "horario": row[3],
                    "status": row[4]
                })
            
            return JsonResponse(lista_concluidas, safe=False)

        except Exception as e:
            return JsonResponse({'erro': str(e)}, status=500)

    return JsonResponse({'erro': 'Apenas GET permitido'}, status=405)


@csrf_exempt
def horarios_ocupados(request, nome_profissional):
    if request.method == 'GET':
        try:
            with connection.cursor() as cursor:
                # MUDANÇA: Removi o "AND status = 'agendado'"
                # Agora ele traz TUDO desse médico, não importa o status
                cursor.execute(
                    "SELECT date, hora FROM alunos WHERE profissional = %s", 
                    [nome_profissional]
                )
                rows = cursor.fetchall()
                
                lista = []
                for row in rows:
                    lista.append({
                        "date": str(row[0]),
                        "horario": row[1]
                    })
                
            return JsonResponse(lista, safe=False)
        except Exception as e:
            return JsonResponse({'erro': str(e)}, status=500)
            
    return JsonResponse([], safe=False)