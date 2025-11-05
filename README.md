# Assistência Psicológica para Pacientes Oncológicos

## Descrição

O **Aplicativo de Assistência Psicológica para Pacientes Oncológicos** visa proporcionar um ambiente digital acolhedor e eficiente para pacientes em tratamento oncológico. Através de uma interface amigável e interativa, o app permite o registro diário de sentimentos, tratamento e experiências dos pacientes. Além disso, oferece funcionalidades de acompanhamento psicológico com psicólogos, chatbot inteligente para esclarecimento de dúvidas com base em artigos científicos, e recursos motivacionais para incentivar o uso diário.

### Funcionalidades principais:

- **Diário de Paciente**: O paciente pode registrar seus sentimentos, progresso e experiências diárias, incluindo input de texto e mídias.
- **Agendamento com Psicólogos**: Facilita o agendamento de consultas com psicólogos especializados no cuidado de pacientes oncológicos.
- **Chatbot de IA**: Um assistente virtual treinado com artigos científicos, projetado para responder perguntas de maneira precisa e validar informações.
- **Relatos de Casos**: Uma seção com relatos de pacientes que passaram por experiências similares, oferecendo apoio emocional.
- **Motivação Diária**: O app utiliza uma lógica gamificada semelhante ao Duolingo, com feedbacks e recompensas diárias para estimular o uso contínuo.
- **Cadastro e Login**: Sistema de login e registro de novos usuários.
- **Banco de Dados Relacional**: O backend será desenvolvido com Django, garantindo um gerenciamento eficiente dos dados dos pacientes.

## Tecnologias

- **Frontend**: React Native, Expo (para otimizar o desenvolvimento e facilitar o uso de APIs)
- **Backend**: Django (provável)
- **Banco de Dados**: Relacional (provavelmente PostgreSQL ou MySQL)
- **Inteligência Artificial**: Chatbot de IA generativa (terceirizado)

## Como rodar o projeto

### Pré-requisitos

- Node.js
- Expo CLI (caso não tenha instalado, você pode instalar com o comando `npm install -g expo-cli`)
- React Native CLI
- Python (para o backend)
- Django (para o backend)

### Instalação do Frontend com Expo

1. Clone este repositório.
2. Navegue até o diretório do projeto.
3. Instale as dependências com o comando: 'npm install'
4. Inicie o projeto com Expo: 'expo start'

O comando acima abrirá o projeto no navegador, e você pode ver o app no seu dispositivo móvel usando o **Expo Go**.

### Instalação do Backend

1. Clone o repositório do backend.
2. Navegue até o diretório do backend.
3. Crie e ative um ambiente virtual.
4. Instale as dependências com o comando: 'pip install -r requirements.txt'
5. Configure o banco de dados **PostgreSQL**. Certifique-se de criar o banco de dados com o nome especificado no arquivo de configuração do Django (geralmente no `settings.py`).
6. Aplique as migrações para criar as tabelas no banco de dados: 'python manage.py migrate'

## Contribuindo

Contribuições são bem-vindas! Siga estas etapas para contribuir:

1. Faça um fork deste repositório.
2. Crie uma branch para suas modificações.
3. Faça commit das suas mudanças.
4. Envie para o repositório remoto.
5. Abra um pull request.

## Licença

Este projeto é licenciado sob a [Licença MIT](LICENSE).
