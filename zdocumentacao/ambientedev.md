#  Guia de Fluxo de Trabalho (Rotina Diária)

Este guia é para membros da equipe que **já passaram pela configuração inicial** e estão voltando ao projeto para codificar.

---

## 1. 🏁 Início: Sincronizar e Verificar

Antes de abrir o código, sincronize seu repositório local com o do GitHub e garanta que o banco de dados esteja no ar.

1.  **Abra o Terminal** na pasta **raiz** do projeto (`Aplicativo-Oncologico`).

2.  **Puxe as Atualizações (Pull):**
    Baixe as últimas alterações feitas pela equipe.

    ```bash
    git pull
    ```

3.  **Verifique o Serviço do PostgreSQL:**
    * Abra o "Serviços" do Windows (Pressione `Win + R` e digite `services.msc`).
    * Encontre `postgresql-x64-XX` na lista.
    * Se o "Status" não for "Em Execução", clique com o botão direito e selecione **"Iniciar"**.

---

## 2. 🚀 Executando o Backend (Django)

1.  **Navegue e Ative:**
    (No seu terminal, a partir da pasta raiz)

    ```bash
    cd backend
    mamba activate apponco
    ```

2.  **Atualize as Dependências:**
    (Se o `git pull` alterou o `requirements.txt`, este comando instalará os novos pacotes. É seguro rodar de qualquer forma).

    ```bash
    pip install -r requirements.txt
    ```

3.  **Aplique as Migrações:**
    (Se o `git pull` alterou os `models.py`, este comando atualizará o banco de dados. É seguro rodar de qualquer forma).

    ```bash
    python manage.py migrate
    ```

4.  **Inicie o Servidor:**
    ```bash
    python manage.py runserver
    ```
    *Deixe este terminal rodando. O backend estará no ar em `http://127.0.0.1:8000/`.*

---

## 3. 📱 Executando o Frontend (Expo)

1.  **Abra um *Novo Terminal***.

2.  **Navegue:**
    (No novo terminal, a partir da pasta raiz)
    ```bash
    cd frontend
    ```

3.  **Atualize as Dependências:**
    (Se o `git pull` alterou o `package.json`, este comando instalará os novos pacotes. É seguro rodar de qualquer forma).

    ```bash
    npm install
    ```

4.  **Inicie o Expo:**
    ```bash
    npx expo start
    ```
    *Escaneie o QR Code com o app **Expo Go** no seu celular.*

---
---

# Guia de Fluxo de Trabalho Git (Add, Commit, Push)

Este guia detalha o processo diário para salvar e compartilhar seu código com a equipe usando Git, seguindo os padrões de commit do projeto.

---

## O Ciclo de Desenvolvimento

Siga estes passos toda vez que você finalizar uma tarefa ou uma parte lógica do seu trabalho.

### 1. Sincronize com o Repositório Remoto

**Sempre** puxe as atualizações mais recentes da equipe antes de começar a codificar ou antes de enviar suas próprias mudanças. Isso evita a maioria dos conflitos.

git pull


### 2. Codifique Suas Mudanças

Faça seu trabalho: crie, edite ou delete os arquivos no VS Code.

### 3. Verifique o Que Mudou

Use `git status` para ver uma lista de todos os arquivos que você modificou. Isso ajuda a garantir que você não está esquecendo nada.

git status


### 4. Adicione os Arquivos ao "Palco" (Stage)

Adicione os arquivos que você quer salvar no próximo commit. Para adicionar todos os arquivos modificados de uma vez:

git add .

*(Dica: Se quiser adicionar apenas um arquivo específico, use `git add caminho/para/o/arquivo.js`)*

### 5. Salve Suas Mudanças (Commit)

Faça o "commit", que é um "snapshot" (foto) das suas mudanças. Use uma mensagem clara seguindo os padrões do projeto (veja a próxima seção).

git commit -m "tipo: sua mensagem curta e descritiva aqui"


### 6. Envie para o GitHub (Push)

Agora, envie seu(s) commit(s) locais para o repositório remoto (GitHub) para que a equipe possa vê-los e acessá-los.

git push


---

## Padrões de Mensagens de Commit

Para manter o histórico do projeto organizado e legível, usamos um padrão para as mensagens de commit. O formato é:

**tipo: O que você fez**

Aqui estão os principais "tipos" que usamos (baseados no `README.md` do projeto):

* **feat:** (Feature) Adição de uma nova funcionalidade ou "feature".
    * *Ex: `git commit -m "feat: adiciona tela de login"`*
    * *Ex: `git commit -m "feat: implementa diário do paciente no backend"`*

* **fix:** (Fix) Correção de um bug ou problema no código.
    * *Ex: `git commit -m "fix: corrige crash ao salvar diário sem texto"`*
    * *Ex: `git commit -m "fix: botão de agendamento não aparecia"`*

* **docs:** (Documentation) Mudanças em arquivos de documentação (como este `README.md`, ou o guia de instalação).
    * *Ex: `git commit -m "docs: atualiza guia de instalação do backend"`*

* **chore:** (Chore) Tarefas de manutenção que não afetam o código do usuário.
    * *Ex: `git commit -m "chore: atualiza pacotes do expo"`*
    * *Ex: `git commit -m "chore: adiciona .env ao gitignore"`*

### Outros Tipos Úteis

* **refactor:** Refatoração de código (quando você "limpa" ou melhora o código sem mudar sua funcionalidade).
* **style:** Mudanças de formatação, ponto e vírgula, espaçamento, etc. (Não afeta a lógica).
* **test:** Adição ou correção de testes automatizados.