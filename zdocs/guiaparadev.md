# Guia de Fluxo de Trabalho (Rotina Diaria)

Este guia e destinado a membros da equipe que **ja passaram pela configuracao inicial**
e estao retornando ao projeto para desenvolver novas funcionalidades.

---

## 1. Inicio: Sincronizar e Subir o Ambiente

Antes de codificar, sincronize seu repositorio local e suba os containers do projeto.

1. Abra o terminal na pasta **raiz** do projeto (Aplicativo-Oncologico).

2. Puxe as ultimas atualizacoes do repositorio remoto:

git pull

3. Suba o ambiente de desenvolvimento com Docker:

docker compose up --build

Este comando inicia:
- Banco de dados PostgreSQL
- Backend Django

Deixe esse terminal rodando enquanto estiver desenvolvendo backend.

---

## 2. Executando o Backend (Django)

O backend roda **dentro do Docker**, nao sendo necessario:

- Ativar ambiente virtual
- Instalar dependencias Python manualmente
- Iniciar banco de dados local

### Rodar migrations (quando necessario)

Se o pull trouxe alteracoes em models ou migrations:

docker compose exec backend python manage.py makemigrations
docker compose exec backend python manage.py migrate

### Acesso
- API Backend: http://localhost:8000
- Admin Django: http://localhost:8000/admin

---

## 3. Executando o Frontend (Expo)

O frontend **nao roda em Docker** e deve ser executado localmente.

1. Abra um **novo terminal**.

2. Navegue para a pasta frontend:

cd frontend

3. Instale dependencias (seguro rodar sempre):

npm install

4. Inicie o Expo:

npx expo start

Para testes em dispositivo fisico, ajuste a variavel
EXPO_PUBLIC_API_BASE_URL no arquivo frontend/.env
para o IP da maquina local.

---

---

# Guia de Fluxo de Trabalho Git (Add, Commit, Push)

Este guia descreve o processo padrao para versionamento e colaboracao usando Git.

---

## Ciclo Diario de Desenvolvimento

### 1. Sincronizar com o Repositorio Remoto

Antes de iniciar qualquer trabalho:

git pull

Isso reduz drasticamente conflitos.

---

### 2. Desenvolver

Implemente sua funcionalidade ou correcao normalmente no codigo.

---

### 3. Verificar Alteracoes

Antes de salvar, confira os arquivos modificados:

git status

---

### 4. Adicionar Arquivos ao Stage

Para adicionar todas as alteracoes:

git add .

Ou apenas arquivos especificos:

git add caminho/para/o/arquivo

---

### 5. Criar Commit

Salve suas alteracoes com uma mensagem clara e padronizada:

git commit -m "tipo: descricao curta do que foi feito"

---

### 6. Enviar para o Repositorio Remoto

Compartilhe seu trabalho com a equipe:

git push

---

## Padrao de Mensagens de Commit

Formato utilizado:

tipo: o que foi feito

### Tipos Principais

- feat: nova funcionalidade
  Ex: feat: implementa diario do paciente

- fix: correcao de bug
  Ex: fix: corrige erro ao salvar sintomas

- docs: documentacao
  Ex: docs: atualiza guia de desenvolvimento

- chore: manutencao e configuracoes
  Ex: chore: ajusta docker-compose

### Tipos Complementares

- refactor: melhoria de codigo sem mudar comportamento
- style: ajustes de formatacao
- test: adicao ou correcao de testes

---

## Observacoes Importantes

- Nunca versionar arquivos .env
- Nunca rodar banco de dados local fora do Docker
- Sempre rodar migrations apos alteracoes em models
- Em caso de erro no backend, verificar logs com:

docker compose logs backend
