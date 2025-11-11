# Guia de Configuração de Ambiente para Novos Membros

Bem-vindo(a) ao projeto! Este guia descreve os passos para configurar o ambiente de desenvolvimento completo (Backend e Frontend) em uma máquina Windows a partir do repositório.

## Parte 1: Pré-requisitos (Instalações Globais)

Garanta que você tenha os seguintes softwares instalados na sua máquina:

1.  **Git:** Essencial para clonar o código.
2.  **Mamba/Conda:** Para gerenciar os ambientes Python.
3.  **Node.js:** v20 ou superior (Instalador "LTS" do [site oficial](https://nodejs.org/en)).
4.  **PostgreSQL Server (v15+):**
    * Baixe o instalador da [EnterpriseDB](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads).
    * Durante a instalação, marque **`PostgreSQL Server`** e **`pgAdmin 4`**.
    * **Anote a senha** que você definir para o usuário `postgres`.
    * Desmarque o "Stack Builder" no final.
5.  **App Expo Go:** Instale o app "Expo Go" no seu celular (iOS/Android).

---

## Parte 2: Configuração Inicial

### 2.1. 🔽 Clonar o Repositório

Este é o primeiro passo. Clone o projeto do GitHub para sua máquina.

```bash
git clone (url-do-repositorio-principal)
cd Aplicativo-Oncologico
```

### 2.2. 🐘 Configurar o Banco de Dados Local

Você precisa criar um banco de dados e um usuário no seu PostgreSQL local para o projeto.

1.  Verifique o Serviço: Garanta que o serviço postgresql-x64-XX esteja "Em Execução" no services.msc.
2.  Conecte-se como Admin: Abra o pgAdmin 4 (ou a extensão do VS Code) e conecte-se ao seu servidor local.
    - Usuário: postgres
    - Senha: (A senha de admin que você definiu na instalação).
3.  Execute o Script SQL: Abra uma "New Query" e rode o script abaixo:

```SQL
/* 1. Cria o usuário (role) que o app Django vai usar */
/* IMPORTANTE: Defina uma senha forte aqui e anote-a */
CREATE USER apponco_user WITH PASSWORD 'uma-senha-forte-para-o-dev';

/* 2. Cria o banco de dados */
CREATE DATABASE apponco_db OWNER apponco_user;

/* 3. Garanta as permissões */
GRANT ALL PRIVILEGES ON DATABASE apponco_db TO apponco_user;
```

---

## Parte 3: Configuração do Backend (Django)

### 1. Crie o Ambiente Python:
```bash
mamba create -n apponco python=3.11
Ative o Ambiente:
```

### 2. Ative o ambiente:
```bash
mamba activate apponco
Navegue e Instale Dependências:
```

### 3. Navegue e Instale Dependências:
```bash
cd backend
pip install -r requirements.txt
```

### 4. 🔐 Crie o Arquivo .env de Segurança:
- O arquivo backend/.env (que contém os segredos) não está no Git. Você deve criá-lo manualmente.
- Crie um novo arquivo chamado .env dentro da pasta backend.
- Cole o seguinte conteúdo dentro dele, atualizando com seus dados:

```Ini, TOML
# Conteúdo para backend/.env
# Use a senha que VOCÊ definiu no Passo 2.2
DATABASE_PASSWORD=uma-senha-forte-para-o-dev
# Peça a SECRET_KEY para o líder da equipe (ela é compartilhada)
SECRET_KEY='cole-a-secret-key-do-time-aqui'
```

### 5. 🚀 Rode as Migrações: (Ainda na pasta backend com o ambiente apponco ativado)
```bash
python manage.py migrate
```
Se você vir "OK", o backend está conectado ao banco!

---

## Parte 4: Configuração do Frontend (Expo)
### 1. Navegue e Instale Dependências:
- Abra um novo terminal.
- Navegue até a pasta frontend.
```bash
cd ../frontend
npm install
```
(O npm install lê o package.json que veio do clone e instala tudo).

### 2. Inicie o Servidor Expo:
```bash
npx expo start
```

### 3. Visualize:
Escaneie o QR Code (que apareceu no seu navegador/terminal) com o app Expo Go no seu celular.