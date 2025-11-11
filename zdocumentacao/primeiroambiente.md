# Guia de Configuração do Ambiente (Backend)

Este documento descreve os passos necessários para configurar o ambiente de desenvolvimento do backend do projeto (Django + PostgreSQL) em uma máquina Windows.

## 1. 🐍 Ambiente Python (Mamba/Conda)

Primeiro, preparamos o ambiente Python isolado para o projeto.

1.  **Crie o Ambiente:**
    Abra o terminal e crie um novo ambiente Mamba (ou Conda) com Python 3.11.
    ```bash
    mamba create -n apponco python=3.11
    ```

2.  **Ative o Ambiente:**
    Sempre que for trabalhar no projeto, você deve ativar este ambiente.
    ```bash
    mamba activate apponco
    ```

3.  **Clone o Repositório e Instale Dependências:**
    (Se você já clonou, pule para o `cd`)
    ```bash
    git clone (url-do-repo-backend)
    cd app-onco-backend
    ```

4.  **Instale os Pacotes:**
    Com o ambiente `apponco` ativado, instale todas as dependências listadas no `requirements.txt`.
    ```bash
    pip install -r requirements.txt
    ```
    *(Este arquivo deve conter `django`, `djangorestframework` e `psycopg2-binary`).*

---

## 2. 🐘 Instalação do PostgreSQL (Servidor do Banco)

O Django precisa se conectar a um servidor de banco de dados. Vamos usar o PostgreSQL.

1.  **Baixe o Instalador:**
    * Vá para o site oficial da EDB (EnterpriseDB), que fornece o instalador para Windows:
    * **Link:** [https://www.enterprisedb.com/downloads/postgres-postgresql-downloads](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads)

2.  **Execute a Instalação:**
    * Durante a instalação, na tela "Select Components", garanta que **`PostgreSQL Server`** e **`pgAdmin 4`** estejam marcados.
    * Defina uma **senha para o superusuário `postgres`**. Guarde esta senha; ela é a chave de administrador do seu servidor.
    * Na última tela, **desmarque** a caixa "Launch Stack Builder at exit?".

3.  **Verifique o Serviço:**
    * Para garantir que o servidor está rodando, abra o painel "Serviços" (Pressione `Win + R`, digite `services.msc` e OK).
    * Procure por `postgresql-x64-XX` (ex: `postgresql-x64-17`). O status deve ser "Em Execução".

---

## 3. 🏦 Criação do Banco de Dados (SQL)

Agora, vamos criar o banco de dados e o usuário específicos para este projeto, para não usar o superusuário `postgres`.

1.  **Conecte-se ao Servidor:**
    * Baixe a extensão **"PostgreSQL"** (ícone 🐘) no VS Code e acesse o símbolo de elefante na barra lateral.
    * Crie uma nova conexão com o seu servidor local usando as seguintes credenciais:
        * **Host:** `localhost`
        * **Usuário:** `postgres`
        * **Senha:** (A senha de administrador que você criou no Passo 2).
        * **Database:** `postgres`

2.  **Execute o Script SQL:**
    * Clique com o botão direito no nome do servidor e selecione **"New Query"** (Nova Consulta).
    * Cole e execute o script SQL abaixo.

    > **Importante:** Defina uma senha forte em `PASSWORD` e anote-a.

    ```sql
    /* 1. Cria o usuário (role) que o app Django vai usar */
    CREATE USER apponco_user WITH PASSWORD '<sua-senha-segura-aqui>';

    /* 2. Cria o banco de dados e define o novo usuário como dono */
    CREATE DATABASE apponco_db OWNER apponco_user;

    /* 3. Garante que o usuário tenha todas as permissões no banco */
    GRANT ALL PRIVILEGES ON DATABASE apponco_db TO apponco_user;
    ```

---

## 4. ⚙️ Configuração do Projeto Django

O projeto Django já existe (veio do `git clone`), mas precisamos dizer a ele como encontrar o banco de dados que acabamos de criar.

1.  **Edite o `settings.py`:**
    * No seu projeto, abra o arquivo `app-onco-backend/apponco_api/settings.py`.
    * Localize a seção `DATABASES`.

2.  **Configure a Conexão:**
    * Substitua o conteúdo da seção `DATABASES` para que o Django aponte para o seu PostgreSQL:

    ```python
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': 'apponco_db',
            'USER': 'apponco_user',
            'PASSWORD': '<sua-senha-segura-aqui>', # A senha do Passo 3
            'HOST': 'localhost',
            'PORT': '5432',
        }
    }
    ```

    > **⚠️ Aviso de Segurança:**
    > Não faça commit deste arquivo com a senha visível! O ideal é usar variáveis de ambiente (`.env`). Por enquanto, apenas certifique-se de que este arquivo (`settings.py`) está no `.gitignore` se você for adicionar a senha real.

---

## 5. 🚀 Verificação Final

Para confirmar que tudo está 100% conectado:

1.  **Ative o Ambiente:** `mamba activate apponco`
2.  **Navegue até a Pasta:** `cd app-onco-backend`
3.  **Rode as Migrações:**
    ```bash
    python manage.py migrate
    ```

Se você vir várias linhas com "Applying..." e "OK" no final, a configuração foi um sucesso! O Django se conectou ao PostgreSQL e criou as tabelas iniciais.

**Para testar o servidor, rode:**
```bash
python manage.py runserver
```

# Guia de Configuração do Ambiente (Frontend)

Este documento descreve os passos necessários para configurar o ambiente de desenvolvimento do frontend do projeto (React Native + Expo) em uma máquina Windows.

## 1. 📱 Pré-requisitos

Antes de começar, você precisa de três coisas:

1.  **Node.js (v20 ou superior):**
    * O Node.js é o ambiente de execução do JavaScript (similar ao Python para o backend) e inclui o `npm` (gerenciador de pacotes).
    * Verifique sua versão no terminal: `node -v`
    * Se não o tiver, baixe e instale a versão "LTS" do [site oficial do Node.js](https://nodejs.org/en).

2.  **Git:**
    * Necessário para clonar o repositório.

3.  **App Expo Go (no Celular):**
    * Este aplicativo permite que você visualize e teste o app no seu smartphone (Android ou iOS) em tempo real, sem precisar de emuladores complexos.
    * Instale-o pela [App Store (iOS)](https://apps.apple.com/br/app/expo-go/id982107779) ou [Google Play (Android)](https://play.google.com/store/apps/details?id=host.exp.exponent).

---

## 2. 🚀 Configuração do Projeto

1.  **Clone o Repositório:**
    Abra seu terminal na pasta onde costuma guardar seus projetos.
    ```bash
    git clone (url-do-repo-frontend)
    ```

2.  **Entre na Pasta do Projeto:**
    ```bash
    cd app-onco-frontend
    ```

3.  **Instale as Dependências:**
    Este comando lê o arquivo `package.json` e baixa todas as bibliotecas necessárias (Expo, React, React Native, etc.).
    ```bash
    npm install
    ```
    *(Isso pode levar alguns minutos).*

---

## 3. 🏃 Executando o Aplicativo

1.  **Inicie o Servidor Expo:**
    Com o `npm install` concluído, inicie o servidor de desenvolvimento:
    ```bash
    npx expo start
    ```
    > **Nota:** Você não precisa "instalar" o Expo no seu PC. O `npx` (Node Package Execute) usa o pacote Expo que foi baixado *localmente* para o projeto (na pasta `node_modules`).

2.  **Escaneie o QR Code:**
    * O comando acima abrirá uma nova aba no seu navegador (Expo Dev Tools).
    * Nessa página, você verá um **QR Code** no canto inferior esquerdo.
    * Abra o app **Expo Go** no seu celular e escaneie esse QR Code.

O aplicativo `apponco` será compilado e carregado automaticamente no seu celular. Qualquer alteração que você salvar no código (ex: no `App.js`) aparecerá em tempo real no dispositivo.